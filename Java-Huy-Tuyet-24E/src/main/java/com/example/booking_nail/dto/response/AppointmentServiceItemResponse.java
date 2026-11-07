package com.example.booking_nail.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentServiceItemResponse {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private BigDecimal price;
}
