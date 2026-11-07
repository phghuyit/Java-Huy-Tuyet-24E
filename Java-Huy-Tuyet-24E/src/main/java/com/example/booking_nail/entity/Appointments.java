package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "appointments")
public class Appointments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", unique = true)
    private String bookingCode;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "guest_name")
    private String guestName;

    @Column(name = "guest_phone")
    private String guestPhone;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "coupon_id")
    private Long couponId;

    @Column(name = "appointment_date")
    private LocalDate appointmentDate;

    @Column(name = "start_time")
    private LocalTime timeStart;

    @Column(name = "end_time")
    private LocalTime timeEnd;

    @Column(name = "total_duration")
    private Integer totalDuration;

    @Column(name = "subtotal")
    private BigDecimal subTotal;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    private String status;

    private String note;

    @Column(name = "admin_note")
    private String adminNote;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "amount_paid")
    private BigDecimal amountPaid;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null || this.status.isBlank()) {
            this.status = "PENDING";
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
