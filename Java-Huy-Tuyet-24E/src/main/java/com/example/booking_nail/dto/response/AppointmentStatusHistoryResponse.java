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
public class AppointmentStatusHistoryResponse {
    private Long id;
    private String fromStatus;
    private String toStatus;
    private String note;
    private Long changedBy;
    private LocalDateTime createdAt;
}
