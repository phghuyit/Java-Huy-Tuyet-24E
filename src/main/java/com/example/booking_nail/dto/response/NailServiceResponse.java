package com.example.booking_nail.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NailServiceResponse {
    private Long id;
    private Long categoryId;
    private String name;
    private Double price;
    private Integer durationMinutes;
    private String description;
    private String imageUrl;
    private String status;
}
