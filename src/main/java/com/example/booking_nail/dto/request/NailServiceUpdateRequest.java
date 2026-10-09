package com.example.booking_nail.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class NailServiceUpdateRequest {
    private Long categoryId;
    private String name;
    private Double price;
    private Integer durationMinutes;
    private String description;
    private String imageUrl;
    private String status;
}
