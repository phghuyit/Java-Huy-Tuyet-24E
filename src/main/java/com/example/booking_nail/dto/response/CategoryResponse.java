package com.example.booking_nail.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
}
