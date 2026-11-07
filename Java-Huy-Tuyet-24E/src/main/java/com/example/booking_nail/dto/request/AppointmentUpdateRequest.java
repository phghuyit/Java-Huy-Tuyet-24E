package com.example.booking_nail.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentUpdateRequest {
    private Long staffId;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime timeStart;
    private LocalTime endTime;
    private LocalTime timeEnd;
    private String status;
    private String notes;
    private String note;
    private String adminNote;

    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal amountPaid;
}
