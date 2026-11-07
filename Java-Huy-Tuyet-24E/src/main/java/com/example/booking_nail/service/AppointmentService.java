package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.AppointmentCreationRequest;
import com.example.booking_nail.dto.request.AppointmentStatusUpdateRequest;
import com.example.booking_nail.dto.request.AppointmentUpdateRequest;
import com.example.booking_nail.dto.response.*;
import com.example.booking_nail.entity.*;
import com.example.booking_nail.mapper.AppointmentMapper;
import com.example.booking_nail.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentService {
    public static final LocalTime SALON_OPEN_TIME = LocalTime.of(7, 0);
    public static final LocalTime SALON_CLOSE_TIME = LocalTime.of(22, 0);
    private static final int OPEN_MINUTES = 7 * 60;
    private static final int CLOSE_MINUTES = 22 * 60;

    private static final Set<String> VALID_PAYMENT_STATUSES = Set.of("UNPAID", "PARTIAL", "PAID");
    private static final Set<String> VALID_PAYMENT_METHODS = Set.of("cash", "transfer", "card", "momo", "vnpay");

    private final AppointmentsRepository appointmentsRepository;
    private final AppointmentServicesRepository appointmentServicesRepository;
    private final AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;
    private final NailServiceRepository nailServiceRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final AppointmentMapper appointmentMapper;

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            "PENDING", Set.of("CONFIRMED", "CANCELLED"),
            "CONFIRMED", Set.of("CHECKED_IN", "CANCELLED", "NO_SHOW"),
            "CHECKED_IN", Set.of("IN_SERVICE"),
            "IN_SERVICE", Set.of("COMPLETED"),
            "COMPLETED", Set.of(),
            "CANCELLED", Set.of(),
            "NO_SHOW", Set.of()
    );

    @Transactional
    public AppointmentResponse createAppointment(AppointmentCreationRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông tin đặt lịch không được để trống");
        }

        LocalDate today = LocalDate.now();
        LocalDate apptDate = request.getAppointmentDate();
        if (apptDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ngày hẹn");
        }
        if (apptDate.isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể đặt lịch trong quá khứ");
        }

        LocalTime timeStart = request.getTimeStart() != null ? request.getTimeStart() : LocalTime.of(9, 0);

        if (apptDate.isEqual(today)) {
            LocalTime minTime = LocalTime.now().plusMinutes(15);
            if (timeStart.isBefore(minTime)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lịch hẹn trong ngày phải đặt trước giờ hẹn ít nhất 15 phút.");
            }
        }

        if (timeStart.isBefore(SALON_OPEN_TIME) || !timeStart.isBefore(SALON_CLOSE_TIME)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ hẹn phải nằm trong khung giờ hoạt động của salon (07:00 - 22:00)");
        }

        if (request.getServiceIds() == null || request.getServiceIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ít nhất một dịch vụ");
        }

        BigDecimal subTotal = BigDecimal.ZERO;
        int totalDuration = 0;
        List<AppointmentServices> servicesToSave = new ArrayList<>();

        for (Long sId : request.getServiceIds()) {
            if (sId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã dịch vụ không hợp lệ");
            }
            NailService service = nailServiceRepository.findById(sId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không tìm thấy dịch vụ với id: " + sId));

            if (service.getStatus() != null && !"ACTIVE".equalsIgnoreCase(service.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dịch vụ '" + service.getName() + "' hiện đang ngừng phục vụ");
            }

            BigDecimal priceSnapshot = service.getPrice() != null
                    ? BigDecimal.valueOf(service.getPrice()) : BigDecimal.ZERO;
            subTotal = subTotal.add(priceSnapshot);

            totalDuration += (service.getDurationMinutes() != null && service.getDurationMinutes() > 0)
                    ? service.getDurationMinutes() : 45;

            servicesToSave.add(new AppointmentServices(null, null, sId, priceSnapshot));
        }

        LocalTime timeEnd = computeAndValidateEndTime(timeStart, totalDuration);

        Long resolvedStaffId = resolveAndLockAvailableStaff(request.getStaffId(), apptDate, timeStart, timeEnd, null);

        BigDecimal discountAmount = BigDecimal.ZERO;
        Long couponId = request.getCouponId();
        if (couponId != null) {
            Coupon coupon = couponRepository.findById(couponId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá không tồn tại"));
            if (Boolean.FALSE.equals(coupon.getActive())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá hiện đang bị vô hiệu hóa");
            }
            LocalDateTime now = LocalDateTime.now();
            if (coupon.getStartAt() != null && now.isBefore(coupon.getStartAt())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá chưa đến thời điểm áp dụng");
            }
            if (coupon.getEndAt() != null && now.isAfter(coupon.getEndAt())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã hết hạn sử dụng");
            }
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã giảm giá đã vượt quá số lượt sử dụng");
            }
            if (coupon.getMinOrderValue() != null && subTotal.compareTo(coupon.getMinOrderValue()) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn hàng chưa đạt giá trị tối thiểu " + coupon.getMinOrderValue() + "đ");
            }
            BigDecimal val = coupon.getDiscountValue() != null ? coupon.getDiscountValue() : BigDecimal.ZERO;
            discountAmount = val.min(subTotal);
            coupon.setUsedCount((coupon.getUsedCount() != null ? coupon.getUsedCount() : 0) + 1);
            couponRepository.save(coupon);
        }

        BigDecimal totalAmount = subTotal.subtract(discountAmount).max(BigDecimal.ZERO);

        Long resolvedCustomerId = request.getCustomerId();
        String guestName = request.getCustomerName() != null ? request.getCustomerName().strip() : null;
        String guestPhone = normalizeVietnamPhone(request.getCustomerPhone());
        String guestEmail = request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()
                ? request.getCustomerEmail().strip().toLowerCase(Locale.ROOT) : null;

        if (resolvedCustomerId != null) {
            User customer = userRepository.findById(resolvedCustomerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khách hàng không tồn tại"));
            if (!"ACTIVE".equalsIgnoreCase(customer.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản khách hàng đang bị khóa");
            }
            if (customer.getRole() != null && "STAFF".equalsIgnoreCase(customer.getRole().getCode())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID khách hàng không hợp lệ");
            }
            if (guestName == null || guestName.isBlank()) guestName = customer.getFullName();
            if (guestPhone == null || guestPhone.isBlank()) guestPhone = customer.getPhone();
            if (guestEmail == null || guestEmail.isBlank()) guestEmail = customer.getEmail();
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                var sessionUser = userRepository.findByEmailIgnoreCase(auth.getName());
                if (sessionUser.isPresent() && sessionUser.get().getRole() != null
                        && "CUSTOMER".equalsIgnoreCase(sessionUser.get().getRole().getCode())) {
                    User u = sessionUser.get();
                    resolvedCustomerId = u.getId();
                    if (guestName == null || guestName.isBlank()) guestName = u.getFullName();
                    if (guestPhone == null || guestPhone.isBlank()) guestPhone = u.getPhone();
                    if (guestEmail == null || guestEmail.isBlank()) guestEmail = u.getEmail();
                }
            }

            if (resolvedCustomerId == null && guestPhone != null && !guestPhone.isBlank()) {
                var foundByPhone = userRepository.findByPhone(guestPhone);
                if (foundByPhone.isPresent() && foundByPhone.get().getRole() != null
                        && "CUSTOMER".equalsIgnoreCase(foundByPhone.get().getRole().getCode())) {
                    User u = foundByPhone.get();
                    resolvedCustomerId = u.getId();
                    if (guestName == null || guestName.isBlank()) guestName = u.getFullName();
                    if (guestEmail == null || guestEmail.isBlank()) guestEmail = u.getEmail();
                }
            }
            if (resolvedCustomerId == null && guestEmail != null && !guestEmail.isBlank()) {
                var foundByEmail = userRepository.findByEmailIgnoreCase(guestEmail);
                if (foundByEmail.isPresent() && foundByEmail.get().getRole() != null
                        && "CUSTOMER".equalsIgnoreCase(foundByEmail.get().getRole().getCode())) {
                    User u = foundByEmail.get();
                    resolvedCustomerId = u.getId();
                    if (guestName == null || guestName.isBlank()) guestName = u.getFullName();
                    if (guestPhone == null || guestPhone.isBlank()) guestPhone = u.getPhone();
                }
            }

            if (resolvedCustomerId == null) {
                if (guestName == null || guestName.isBlank() || guestPhone == null || !guestPhone.matches("^0\\d{9}$")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Vui lòng cung cấp đầy đủ họ tên và số điện thoại hợp lệ (10 chữ số) để đặt lịch");
                }
            }
        }

        Appointments appointment = new Appointments();
        appointment.setBookingCode(request.getBookingCode() != null && !request.getBookingCode().isBlank()
                ? request.getBookingCode().trim().toUpperCase()
                : "VELA-" + (System.currentTimeMillis() % 1000000) + "-" + (int) (Math.random() * 900 + 100));
        appointment.setCustomerId(resolvedCustomerId);
        appointment.setGuestName(guestName);
        appointment.setGuestPhone(guestPhone);
        appointment.setGuestEmail(guestEmail);
        appointment.setStaffId(resolvedStaffId);
        appointment.setCouponId(couponId);
        appointment.setAppointmentDate(apptDate);
        appointment.setTimeStart(timeStart);
        appointment.setTimeEnd(timeEnd);
        appointment.setTotalDuration(totalDuration);
        appointment.setSubTotal(subTotal);
        appointment.setDiscountAmount(discountAmount);
        appointment.setTotalAmount(totalAmount);
        appointment.setStatus("PENDING");
        appointment.setNote(request.getNote());
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        Appointments savedAppointment = appointmentsRepository.save(appointment);

        for (AppointmentServices as : servicesToSave) {
            as.setAppointmentId(savedAppointment.getId());
            appointmentServicesRepository.save(as);
        }

        appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                null,
                savedAppointment.getId(),
                null,
                "PENDING",
                "Đặt lịch hẹn mới",
                resolvedCustomerId,
                LocalDateTime.now()
        ));

        return enrichResponse(savedAppointment);
    }

    private LocalTime computeAndValidateEndTime(LocalTime timeStart, int totalDuration) {
        if (timeStart.isBefore(SALON_OPEN_TIME) || !timeStart.isBefore(SALON_CLOSE_TIME)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giờ bắt đầu phải nằm trong khung giờ mở cửa (07:00 - 22:00)");
        }
        int duration = totalDuration > 0 ? totalDuration : 45;
        int startMinutes = timeStart.getHour() * 60 + timeStart.getMinute();
        int endMinutes = startMinutes + duration;
        if (startMinutes < OPEN_MINUTES || endMinutes > CLOSE_MINUTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Thời lượng dịch vụ kết thúc sau 22:00 (giờ đóng cửa). Vui lòng chọn giờ sớm hơn.");
        }
        return timeStart.plusMinutes(duration);
    }

    private Long resolveAndLockAvailableStaff(Long requestedStaffId, LocalDate apptDate,
                                              LocalTime timeStart, LocalTime timeEnd, Long excludeAppointmentId) {
        if (requestedStaffId != null) {
            User staff = userRepository.findByIdForUpdate(requestedStaffId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kỹ thuật viên được chọn không tồn tại"));
            if (staff.getRole() == null || !"STAFF".equalsIgnoreCase(staff.getRole().getCode())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tài khoản được chọn không phải là kỹ thuật viên (STAFF)");
            }
            if (!"ACTIVE".equalsIgnoreCase(staff.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kỹ thuật viên hiện đang bị khóa hoặc tạm nghỉ");
            }
            boolean overlap = appointmentsRepository.existsOverlap(staff.getId(), apptDate, timeStart, timeEnd, excludeAppointmentId);
            if (overlap) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Chuyên viên đã có lịch trong khung giờ này. Vui lòng chọn giờ hoặc nhân viên khác.");
            }
            return staff.getId();
        }

        List<User> activeStaffList = userRepository.findActiveStaffForUpdate();
        if (activeStaffList.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hiện không có kỹ thuật viên nào đang hoạt động");
        }
        for (User candidate : activeStaffList) {
            boolean overlap = appointmentsRepository.existsOverlap(candidate.getId(), apptDate, timeStart, timeEnd, excludeAppointmentId);
            if (!overlap) {
                return candidate.getId();
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Tất cả kỹ thuật viên đều đã kín lịch trong khung giờ này. Vui lòng chọn khung giờ khác.");
    }

    private static String normalizeVietnamPhone(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return null;
        }
        String digits = rawPhone.replaceAll("\\D", "");
        if (digits.startsWith("84") && digits.length() == 11) {
            digits = "0" + digits.substring(2);
        }
        return digits;
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentsRepository.findAll().stream()
                .map(this::enrichResponse)
                .toList();
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn với id: " + id));
        return enrichResponse(appointment);
    }

    public List<BusySlotResponse> getBusySlots(LocalDate date, Long staffId) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return appointmentsRepository.findBusySlots(queryDate, staffId).stream()
                .map(a -> new BusySlotResponse(a.getId(), a.getStaffId(), a.getAppointmentDate(), a.getTimeStart(), a.getTimeEnd()))
                .toList();
    }

    public AppointmentResponse lookupAppointment(String bookingCode, String phone) {
        if (bookingCode == null || bookingCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập mã đặt lịch");
        }
        String cleanInputPhone = normalizeVietnamPhone(phone);
        if (cleanInputPhone == null || !cleanInputPhone.matches("^0\\d{9}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập số điện thoại hợp lệ (10 chữ số) để xác minh tra cứu");
        }

        String normalizedCode = bookingCode.trim().toUpperCase();
        Appointments appt = appointmentsRepository.findByBookingCode(normalizedCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn khớp với thông tin đã nhập"));

        String apptPhone = appt.getGuestPhone();
        if ((apptPhone == null || apptPhone.isBlank()) && appt.getCustomerId() != null) {
            apptPhone = userRepository.findById(appt.getCustomerId()).map(User::getPhone).orElse(null);
        }
        String cleanApptPhone = normalizeVietnamPhone(apptPhone);

        if (cleanApptPhone == null || !cleanApptPhone.equals(cleanInputPhone)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Số điện thoại không khớp với lịch hẹn này");
        }

        return enrichResponse(appt);
    }

    @Transactional
    public AppointmentResponse cancelLookupAppointment(String bookingCode, String phone, String reason) {
        AppointmentResponse existing = lookupAppointment(bookingCode, phone);
        Appointments appt = appointmentsRepository.findById(existing.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        if (!"PENDING".equalsIgnoreCase(appt.getStatus()) && !"CONFIRMED".equalsIgnoreCase(appt.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lịch hẹn hiện tại không thể hủy trực tuyến");
        }

        String oldStatus = appt.getStatus();
        appt.setStatus("CANCELLED");
        appt.setUpdatedAt(LocalDateTime.now());
        Appointments saved = appointmentsRepository.save(appt);

        appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                null,
                saved.getId(),
                oldStatus,
                "CANCELLED",
                reason != null && !reason.isBlank() ? reason : "Khách hàng hủy qua tra cứu",
                appt.getCustomerId(),
                LocalDateTime.now()
        ));

        return enrichResponse(saved);
    }

    public List<AppointmentResponse> getMyAppointments(Long customerId) {
        if (customerId == null) {
            return List.of();
        }
        return appointmentsRepository.findByCustomerIdOrderByAppointmentDateDescTimeStartDesc(customerId).stream()
                .map(this::enrichResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse rescheduleCustomerAppointment(Long id, User customer, AppointmentUpdateRequest request) {
        Appointments appointment = getOwnedAppointment(id, customer);
        String curStatus = appointment.getStatus() != null ? appointment.getStatus().toUpperCase() : "PENDING";
        if (!Set.of("PENDING", "CONFIRMED").contains(curStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ có thể đổi lịch hẹn đang ở trạng thái Chờ xác nhận hoặc Đã xác nhận");
        }

        LocalDate newDate = request.getAppointmentDate();
        LocalTime newStart = request.getStartTime() != null ? request.getStartTime() : request.getTimeStart();
        if (newDate == null || newStart == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ngày và giờ hẹn mới");
        }

        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();
        if (newDate.isBefore(today)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể dời lịch hẹn về ngày trong quá khứ");
        }
        if (newDate.isEqual(today) && newStart.isBefore(nowTime.plusMinutes(15))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ hẹn phải sau thời điểm hiện tại ít nhất 15 phút");
        }

        AppointmentUpdateRequest updateReq = new AppointmentUpdateRequest();
        updateReq.setAppointmentDate(newDate);
        updateReq.setStartTime(newStart);
        updateReq.setStaffId(request.getStaffId() != null ? request.getStaffId() : appointment.getStaffId());
        if (request.getNote() != null) {
            updateReq.setNote(request.getNote());
        }

        AppointmentResponse updated = updateAppointment(id, updateReq);

        Appointments persisted = appointmentsRepository.findById(id).orElseThrow();
        if (!"PENDING".equalsIgnoreCase(persisted.getStatus())) {
            String prev = persisted.getStatus();
            persisted.setStatus("PENDING");
            persisted.setUpdatedAt(LocalDateTime.now());
            appointmentsRepository.save(persisted);
            appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                    null, id, prev, "PENDING", "Khách hàng đổi lịch hẹn sang khung giờ mới", customer.getId(), LocalDateTime.now()
            ));
            return enrichResponse(persisted);
        }
        return updated;
    }

    @Transactional
    public AppointmentResponse cancelCustomerAppointment(Long id, User customer, String reason) {
        Appointments appointment = getOwnedAppointment(id, customer);
        String curStatus = appointment.getStatus() != null ? appointment.getStatus().toUpperCase() : "PENDING";
        if (!Set.of("PENDING", "CONFIRMED").contains(curStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lịch hẹn này không thể hủy trực tuyến");
        }
        String oldStatus = appointment.getStatus();
        appointment.setStatus("CANCELLED");
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointments saved = appointmentsRepository.save(appointment);

        appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                null,
                saved.getId(),
                oldStatus,
                "CANCELLED",
                reason != null && !reason.isBlank() ? reason : "Khách hàng hủy lịch hẹn từ trang tài khoản",
                customer.getId(),
                LocalDateTime.now()
        ));
        return enrichResponse(saved);
    }

    private Appointments getOwnedAppointment(Long id, User customer) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn"));

        if (customer.getRole() != null && Set.of("ADMIN", "RECEPTIONIST").contains(customer.getRole().getCode().toUpperCase())) {
            return appointment;
        }

        boolean ownedById = appointment.getCustomerId() != null && appointment.getCustomerId().equals(customer.getId());
        String custPhone = normalizeVietnamPhone(customer.getPhone());
        String apptPhone = normalizeVietnamPhone(appointment.getGuestPhone());
        boolean ownedByPhone = custPhone != null && custPhone.equals(apptPhone);
        boolean ownedByEmail = customer.getEmail() != null && appointment.getGuestEmail() != null
                && customer.getEmail().equalsIgnoreCase(appointment.getGuestEmail());

        boolean ownedByLinkedCustomer = false;
        if (appointment.getCustomerId() != null) {
            var linkedUserOpt = userRepository.findById(appointment.getCustomerId());
            if (linkedUserOpt.isPresent()) {
                User linkedUser = linkedUserOpt.get();
                if (linkedUser.getId().equals(customer.getId())) {
                    ownedByLinkedCustomer = true;
                }
                String linkedPhone = normalizeVietnamPhone(linkedUser.getPhone());
                if (custPhone != null && custPhone.equals(linkedPhone)) {
                    ownedByLinkedCustomer = true;
                }
                if (customer.getEmail() != null && customer.getEmail().equalsIgnoreCase(linkedUser.getEmail())) {
                    ownedByLinkedCustomer = true;
                }
            }
        }

        if (!ownedById && !ownedByPhone && !ownedByEmail && !ownedByLinkedCustomer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác trên lịch hẹn này");
        }
        return appointment;
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatusUpdateRequest request) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found with id: " + id));

        if (request == null || request.getStatus() == null || request.getStatus().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        String oldStatus = appointment.getStatus() != null ? appointment.getStatus().trim().toUpperCase() : "PENDING";
        String newStatus = request.getStatus().trim().toUpperCase();

        if (oldStatus.equals(newStatus)) {
            return enrichResponse(appointment);
        }

        Set<String> allowedNext = ALLOWED_TRANSITIONS.getOrDefault(oldStatus, Set.of());
        if (!allowedNext.contains(newStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không thể chuyển trạng thái lịch hẹn từ " + oldStatus + " sang " + newStatus);
        }

        appointment.setStatus(newStatus);
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointments updated = appointmentsRepository.save(appointment);

        appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                null,
                id,
                oldStatus,
                newStatus,
                request.getNote() != null ? request.getNote() : "Cập nhật trạng thái sang " + newStatus,
                request.getChangedBy(),
                LocalDateTime.now()
        ));

        return enrichResponse(updated);
    }

    @Transactional
    public AppointmentResponse recordPayment(Long id, AppointmentUpdateRequest request) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn với id: " + id));

        String curStatus = appointment.getStatus() != null ? appointment.getStatus().toUpperCase() : "PENDING";
        if (Set.of("CANCELLED", "NO_SHOW").contains(curStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể ghi nhận thanh toán cho lịch hẹn đã hủy hoặc vắng mặt");
        }

        applyAndValidatePayment(appointment, request);
        appointment.setUpdatedAt(LocalDateTime.now());
        Appointments saved = appointmentsRepository.save(appointment);
        return enrichResponse(saved);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentUpdateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu cập nhật không hợp lệ");
        }

        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found with id: " + id));

        String curStatus = appointment.getStatus() != null ? appointment.getStatus().toUpperCase() : "PENDING";

        LocalTime requestedStart = request.getStartTime() != null ? request.getStartTime() : request.getTimeStart();
        LocalTime requestedEnd = request.getEndTime() != null ? request.getEndTime() : request.getTimeEnd();
        boolean hasScheduleOrStaffChange = request.getStaffId() != null
                || request.getAppointmentDate() != null
                || requestedStart != null
                || requestedEnd != null
                || (request.getStatus() != null && !request.getStatus().equalsIgnoreCase(curStatus));

        boolean hasPaymentFields = request.getPaymentStatus() != null
                || request.getPaymentMethod() != null
                || request.getAmountPaid() != null;

        if ("COMPLETED".equals(curStatus) && hasPaymentFields && !hasScheduleOrStaffChange) {
            applyAndValidatePayment(appointment, request);
            String noteVal = request.getAdminNote() != null ? request.getAdminNote()
                    : (request.getNotes() != null ? request.getNotes() : request.getNote());
            if (noteVal != null) {
                appointment.setAdminNote(noteVal);
            }
            appointment.setUpdatedAt(LocalDateTime.now());
            return enrichResponse(appointmentsRepository.save(appointment));
        }

        if (Set.of("COMPLETED", "CANCELLED", "NO_SHOW").contains(curStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Không thể chỉnh sửa lịch hẹn đã hoàn thành hoặc đã hủy.");
        }

        boolean scheduleModified = request.getStaffId() != null
                || request.getAppointmentDate() != null
                || requestedStart != null
                || requestedEnd != null;

        if (scheduleModified) {
            LocalDate targetDate = request.getAppointmentDate() != null
                    ? request.getAppointmentDate()
                    : appointment.getAppointmentDate();
            LocalTime targetStart = requestedStart != null
                    ? requestedStart
                    : appointment.getTimeStart();

            if (targetDate == null || targetStart == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ngày và giờ bắt đầu không được để trống");
            }
            LocalDate today = LocalDate.now();
            LocalTime nowTime = LocalTime.now();
            if (targetDate.isBefore(today)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể dời lịch hẹn về ngày trong quá khứ");
            }
            if (targetDate.isEqual(today) && targetStart.isBefore(nowTime.plusMinutes(15))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ hẹn phải sau thời điểm hiện tại ít nhất 15 phút");
            }
            if (requestedEnd != null && !requestedEnd.isAfter(targetStart)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ kết thúc phải sau giờ bắt đầu");
            }

            int duration = appointment.getTotalDuration() != null && appointment.getTotalDuration() > 0
                    ? appointment.getTotalDuration()
                    : 45;
            LocalTime targetEnd = computeAndValidateEndTime(targetStart, duration);

            Long targetStaff = request.getStaffId() != null ? request.getStaffId() : appointment.getStaffId();
            Long resolvedStaff = resolveAndLockAvailableStaff(targetStaff, targetDate, targetStart, targetEnd, id);

            appointment.setStaffId(resolvedStaff);
            appointment.setAppointmentDate(targetDate);
            appointment.setTimeStart(targetStart);
            appointment.setTimeEnd(targetEnd);
            appointment.setTotalDuration(duration);
        }

        String noteVal = request.getAdminNote() != null ? request.getAdminNote()
                : (request.getNotes() != null ? request.getNotes() : request.getNote());
        if (noteVal != null) {
            appointment.setAdminNote(noteVal);
            appointment.setNote(noteVal);
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            String newStatus = request.getStatus().trim().toUpperCase();
            if (!newStatus.equalsIgnoreCase(appointment.getStatus())) {
                String oldStatus = appointment.getStatus();
                Set<String> allowedNext = ALLOWED_TRANSITIONS.getOrDefault(oldStatus, Set.of());
                if (!allowedNext.contains(newStatus)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Không thể chuyển trạng thái lịch hẹn từ " + oldStatus + " sang " + newStatus);
                }
                appointment.setStatus(newStatus);
                appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                        null, id, oldStatus, newStatus, "Cập nhật qua chỉnh sửa lịch hẹn", null, LocalDateTime.now()));
            }
        }

        if (hasPaymentFields) {
            applyAndValidatePayment(appointment, request);
        }

        appointment.setUpdatedAt(LocalDateTime.now());
        Appointments updated = appointmentsRepository.save(appointment);
        return enrichResponse(updated);
    }

    private void applyAndValidatePayment(Appointments appointment, AppointmentUpdateRequest request) {
        String rawStatus = request.getPaymentStatus();
        String rawMethod = request.getPaymentMethod();
        BigDecimal amountPaid = request.getAmountPaid();

        if (amountPaid != null) {
            if (amountPaid.compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán không được nhỏ hơn 0");
            }
            BigDecimal maxAllowed = appointment.getTotalAmount() != null ? appointment.getTotalAmount() : BigDecimal.ZERO;
            if (maxAllowed.compareTo(BigDecimal.ZERO) > 0 && amountPaid.compareTo(maxAllowed) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán không được vượt quá tổng tiền đơn hàng");
            }
        }

        String normalizedMethod = null;
        if (rawMethod != null && !rawMethod.isBlank()) {
            normalizedMethod = rawMethod.strip().toLowerCase(Locale.ROOT);
            if (!VALID_PAYMENT_METHODS.contains(normalizedMethod)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Phương thức thanh toán không hợp lệ (chỉ chấp nhận: cash, transfer, card, momo, vnpay)");
            }
        }

        if (rawStatus != null && !rawStatus.isBlank()) {
            String normalizedStatus = rawStatus.strip().toUpperCase(Locale.ROOT);
            if (!VALID_PAYMENT_STATUSES.contains(normalizedStatus)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Trạng thái thanh toán không hợp lệ (chỉ chấp nhận: UNPAID, PARTIAL, PAID)");
            }
            appointment.setPaymentStatus(normalizedStatus);
            if ("UNPAID".equals(normalizedStatus)) {
                appointment.setPaidAt(null);
                appointment.setPaymentMethod(null);
                appointment.setAmountPaid(BigDecimal.ZERO);
                return;
            }
            if ("PAID".equals(normalizedStatus)) {
                BigDecimal due = appointment.getTotalAmount() != null ? appointment.getTotalAmount() : BigDecimal.ZERO;
                BigDecimal resolvedAmount = amountPaid != null ? amountPaid : due;
                if (due.compareTo(BigDecimal.ZERO) > 0 && resolvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán phải lớn hơn 0");
                }
                appointment.setAmountPaid(resolvedAmount);
                appointment.setPaidAt(LocalDateTime.now());
            } else if (amountPaid != null) {
                appointment.setAmountPaid(amountPaid);
                appointment.setPaidAt(LocalDateTime.now());
            }
        } else if (amountPaid != null) {
            appointment.setAmountPaid(amountPaid);
            if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal due = appointment.getTotalAmount() != null ? appointment.getTotalAmount() : BigDecimal.ZERO;
                appointment.setPaymentStatus(amountPaid.compareTo(due) >= 0 ? "PAID" : "PARTIAL");
                appointment.setPaidAt(LocalDateTime.now());
            }
        }

        if (normalizedMethod != null) {
            appointment.setPaymentMethod(normalizedMethod);
        } else if ("PAID".equalsIgnoreCase(appointment.getPaymentStatus()) && appointment.getPaymentMethod() == null) {
            appointment.setPaymentMethod("cash");
        }
    }

    private AppointmentResponse enrichResponse(Appointments appointment) {
        AppointmentResponse response = appointmentMapper.toResponse(appointment);

        if ("PAID".equalsIgnoreCase(appointment.getPaymentStatus()) ||
                "PARTIAL".equalsIgnoreCase(appointment.getPaymentStatus()) ||
                (appointment.getAmountPaid() != null && appointment.getAmountPaid().compareTo(BigDecimal.ZERO) > 0)) {
            BigDecimal amt = appointment.getAmountPaid() != null ? appointment.getAmountPaid()
                    : (appointment.getTotalAmount() != null ? appointment.getTotalAmount() : BigDecimal.ZERO);
            String method = appointment.getPaymentMethod() != null ? appointment.getPaymentMethod() : "cash";
            LocalDateTime recorded = appointment.getPaidAt() != null ? appointment.getPaidAt()
                    : (appointment.getUpdatedAt() != null ? appointment.getUpdatedAt() : LocalDateTime.now());
            response.setPayment(new AppointmentPaymentResponse(method, amt, null, recorded));
        } else {
            response.setPayment(null);
        }

        List<AppointmentServices> services = appointmentServicesRepository.findByAppointmentId(appointment.getId());
        List<AppointmentServiceItemResponse> serviceResponses = new ArrayList<>();
        for (AppointmentServices as : services) {
            String name = nailServiceRepository.findById(as.getServiceId())
                    .map(NailService::getName).orElse("Unknown Service");
            serviceResponses.add(new AppointmentServiceItemResponse(as.getId(), as.getServiceId(), name, as.getPrice()));
        }
        response.setServices(serviceResponses);

        List<AppointmentStatusHistory> history = appointmentStatusHistoryRepository
                .findByAppointmentIdOrderByCreatedAtDesc(appointment.getId());
        List<AppointmentStatusHistoryResponse> historyResponses = history.stream()
                .map(h -> new AppointmentStatusHistoryResponse(
                        h.getId(), h.getFromStatus(), h.getToStatus(), h.getNote(), h.getChangedBy(), h.getCreatedAt()))
                .toList();
        response.setStatusHistory(historyResponses);

        if (appointment.getCouponId() != null) {
            couponRepository.findById(appointment.getCouponId()).ifPresent(coupon -> {
                response.setCouponCode(coupon.getCode());
                response.setPromotionCode(coupon.getCode());
            });
        }

        response.setCustomerName(appointment.getGuestName());
        response.setCustomerPhone(appointment.getGuestPhone());
        response.setCustomerEmail(appointment.getGuestEmail());

        if (appointment.getCustomerId() != null) {
            userRepository.findById(appointment.getCustomerId()).ifPresent(u -> {
                if (u.getFullName() != null && !u.getFullName().isBlank()) {
                    response.setCustomerName(u.getFullName());
                }
                if (u.getPhone() != null && !u.getPhone().isBlank()) {
                    response.setCustomerPhone(u.getPhone());
                }
                if (u.getEmail() != null && !u.getEmail().isBlank()) {
                    response.setCustomerEmail(u.getEmail());
                }
                response.setCustomer(UserResponse.from(u));
            });
        }

        if (appointment.getStaffId() != null) {
            userRepository.findById(appointment.getStaffId()).ifPresent(st -> {
                response.setStaff(StaffResponse.from(st));
            });
        }

        return response;
    }
}
