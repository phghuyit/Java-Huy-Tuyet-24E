package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "appointment_services")
public class AppointmentServices {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "service_id")
    private Long serviceId;

    private BigDecimal price;
}
