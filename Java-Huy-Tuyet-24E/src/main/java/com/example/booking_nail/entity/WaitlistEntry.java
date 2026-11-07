package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "waitlist_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(name = "desired_date")
    private LocalDate desiredDate;

    @Column(name = "from_time")
    private LocalTime fromTime;

    @Column(name = "to_time")
    private LocalTime toTime;

    @Column(columnDefinition = "TEXT")
    private String note;

    private String status = "WAITING";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "WAITING";
        }
    }
}
