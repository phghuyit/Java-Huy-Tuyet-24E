package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.*;
import com.example.booking_nail.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@Order(5)
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class AppointmentDataInitializer implements CommandLineRunner {
    private final AppointmentsRepository appointmentsRepository;
    private final AppointmentServicesRepository appointmentServicesRepository;
    private final AppointmentStatusHistoryRepository appointmentStatusHistoryRepository;
    private final UserRepository userRepository;
    private final NailServiceRepository nailServiceRepository;

    public AppointmentDataInitializer(
            AppointmentsRepository appointmentsRepository,
            AppointmentServicesRepository appointmentServicesRepository,
            AppointmentStatusHistoryRepository appointmentStatusHistoryRepository,
            UserRepository userRepository,
            NailServiceRepository nailServiceRepository) {
        this.appointmentsRepository = appointmentsRepository;
        this.appointmentServicesRepository = appointmentServicesRepository;
        this.appointmentStatusHistoryRepository = appointmentStatusHistoryRepository;
        this.userRepository = userRepository;
        this.nailServiceRepository = nailServiceRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (appointmentsRepository.count() > 0) {
            return;
        }

        List<User> users = userRepository.findAll();
        if (users.size() < 2) {
            return;
        }

        User customer = users.get(0);
        User staff = users.stream()
                .filter(u -> u.getRole() != null && "STAFF".equals(u.getRole().getCode()))
                .findFirst()
                .orElse(users.get(1));

        List<NailService> services = nailServiceRepository.findAll();
        if (services.isEmpty()) {
            return;
        }

        NailService service1 = services.get(0);
        NailService service2 = services.size() > 1 ? services.get(1) : service1;

        Appointments appt1 = new Appointments();
        appt1.setBookingCode("APPT-SEED-001");
        appt1.setCustomerId(customer.getId());
        appt1.setStaffId(staff.getId());
        appt1.setAppointmentDate(LocalDate.now());
        appt1.setTimeStart(LocalTime.of(9, 30));
        appt1.setTimeEnd(LocalTime.of(10, 30));
        appt1.setTotalDuration(60);
        appt1.setSubTotal(BigDecimal.valueOf(150000));
        appt1.setDiscountAmount(BigDecimal.ZERO);
        appt1.setTotalAmount(BigDecimal.valueOf(150000));
        appt1.setStatus("CONFIRMED");
        appt1.setNote("Khách muốn sơn gel màu pastel nhẹ nhàng.");
        appt1 = appointmentsRepository.save(appt1);

        appointmentServicesRepository.save(new AppointmentServices(null, appt1.getId(), service1.getId(), BigDecimal.valueOf(service1.getPrice())));

        appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                null, appt1.getId(), "PENDING", "CONFIRMED", "Salon đã xác nhận lịch", staff.getId(), LocalDateTime.now().minusHours(1)));

        Appointments appt2 = new Appointments();
        appt2.setBookingCode("APPT-SEED-002");
        appt2.setCustomerId(customer.getId());
        appt2.setStaffId(staff.getId());
        appt2.setAppointmentDate(LocalDate.now().minusDays(1));
        appt2.setTimeStart(LocalTime.of(14, 0));
        appt2.setTimeEnd(LocalTime.of(15, 0));
        appt2.setTotalDuration(60);
        appt2.setSubTotal(BigDecimal.valueOf(80000));
        appt2.setDiscountAmount(BigDecimal.ZERO);
        appt2.setTotalAmount(BigDecimal.valueOf(80000));
        appt2.setStatus("COMPLETED");
        appt2.setNote("Khách rất hài lòng với màu sơn mới.");
        appt2 = appointmentsRepository.save(appt2);

        appointmentServicesRepository.save(new AppointmentServices(null, appt2.getId(), service2.getId(), BigDecimal.valueOf(service2.getPrice())));

        appointmentStatusHistoryRepository.save(new AppointmentStatusHistory(
                null, appt2.getId(), "PENDING", "COMPLETED", "Hoàn thành và đã thanh toán", staff.getId(), LocalDateTime.now().minusDays(1)));
    }
}
