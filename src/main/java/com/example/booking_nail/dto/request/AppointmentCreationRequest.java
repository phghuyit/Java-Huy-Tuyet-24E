package com.example.booking_nail.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter @Setter
public class AppointmentCreationRequest {
    private String bookingCode;
    private Long staffId;
    private Long customerId;
    private Long couponId;
    private LocalDate appointmentDate;
    private LocalTime timeStart;
    private LocalTime timeEnd;
    private Integer totalDuration;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private String note;
}
