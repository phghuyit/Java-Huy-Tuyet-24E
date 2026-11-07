package com.example.booking_nail.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {
    private Long id;
    private String bookingCode;
    private Long staffId;
    private Long customerId;
    private Long couponId;
    private String couponCode;
    private String promotionCode;
    private LocalDate appointmentDate;
    private LocalTime timeStart;
    private LocalTime timeEnd;
    private Integer totalDuration;
    private BigDecimal subTotal;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String status;
    private String note;
    private String adminNote;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal amountPaid;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private UserResponse customer;
    private StaffResponse staff;

    private AppointmentPaymentResponse payment;

    private List<AppointmentServiceItemResponse> services;
    private List<AppointmentStatusHistoryResponse> statusHistory;
}
