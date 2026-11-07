package com.example.booking_nail.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long appointmentId;
    private Long userId;
    private Long staffId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
