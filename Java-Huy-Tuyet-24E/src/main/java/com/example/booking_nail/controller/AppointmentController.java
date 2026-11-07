package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.AppointmentCreationRequest;
import com.example.booking_nail.dto.request.AppointmentStatusUpdateRequest;
import com.example.booking_nail.dto.request.AppointmentUpdateRequest;
import com.example.booking_nail.dto.request.BookingLookupRequest;
import com.example.booking_nail.dto.response.AppointmentResponse;
import com.example.booking_nail.dto.response.BusySlotResponse;
import com.example.booking_nail.service.AppointmentService;
import com.example.booking_nail.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;
    private final AuthService authService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse createAppointment(@RequestBody(required = false) AppointmentCreationRequest request) {
        return appointmentService.createAppointment(request);
    }

    @GetMapping
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentService.getAllAppointments();
    }

    @GetMapping("/busy-slots")
    public List<BusySlotResponse> getBusySlots(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long staffId) {
        return appointmentService.getBusySlots(date, staffId);
    }

    @GetMapping("/lookup")
    public AppointmentResponse lookupAppointmentGet(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String bookingCode,
            @RequestParam(required = false) String phone) {
        String resolvedCode = (code != null && !code.isBlank()) ? code : bookingCode;
        return appointmentService.lookupAppointment(resolvedCode, phone);
    }

    @PostMapping("/lookup")
    public AppointmentResponse lookupAppointment(@RequestBody(required = false) BookingLookupRequest request) {
        if (request == null) {
            return appointmentService.lookupAppointment(null, null);
        }
        return appointmentService.lookupAppointment(request.getBookingCode(), request.getPhone());
    }

    @PostMapping("/lookup/cancel")
    public AppointmentResponse cancelLookupAppointment(@RequestBody(required = false) BookingLookupRequest request) {
        if (request == null) {
            return appointmentService.cancelLookupAppointment(null, null, null);
        }
        return appointmentService.cancelLookupAppointment(request.getBookingCode(), request.getPhone(), request.getReason());
    }

    @GetMapping("/my")
    public List<AppointmentResponse> getMyAppointments(Authentication authentication,
                                                       @RequestParam(required = false) Long customerId) {
        Long targetCustomerId = customerId;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            var authUser = authService.currentUser(authentication.getName());
            if (authUser != null) {
                if ("CUSTOMER".equalsIgnoreCase(authUser.roleCode()) || targetCustomerId == null) {
                    targetCustomerId = authUser.id();
                }
            }
        }
        return appointmentService.getMyAppointments(targetCustomerId);
    }

    @GetMapping("/{id:[0-9]+}")
    public AppointmentResponse getAppointmentById(@PathVariable Long id) {
        return appointmentService.getAppointmentById(id);
    }

    @PutMapping("/{id:[0-9]+}")
    public AppointmentResponse updateAppointment(@PathVariable Long id, @RequestBody(required = false) AppointmentUpdateRequest request) {
        return appointmentService.updateAppointment(id, request);
    }

    @PatchMapping("/{id:[0-9]+}/status")
    public AppointmentResponse updateStatus(@PathVariable Long id, @RequestBody(required = false) AppointmentStatusUpdateRequest request) {
        return appointmentService.updateStatus(id, request);
    }

    @PatchMapping("/{id:[0-9]+}/payment")
    public AppointmentResponse recordPayment(@PathVariable Long id, @RequestBody(required = false) AppointmentUpdateRequest request) {
        return appointmentService.recordPayment(id, request);
    }
}
