package com.example.booking_nail.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WaitlistResponse {
    private Long id;
    private Long customerId;
    private String name;
    private String phone;
    private String email;
    private Long serviceId;
    private Long staffId;
    private LocalDate desiredDate;
    private LocalTime fromTime;
    private LocalTime toTime;
    private String note;
    private String status;
    private LocalDateTime createdAt;
}
