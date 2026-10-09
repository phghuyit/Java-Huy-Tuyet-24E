package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity @Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "appointments")
public class Appointments {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
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
