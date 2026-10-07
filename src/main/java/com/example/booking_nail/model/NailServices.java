package com.example.booking_nail.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NailServices {
    @Id
    @GeneratedValue (strategy= GenerationType.IDENTITY)
    private Long id;
    private Long categoryId;
    private String name;
    private Double price;
    private Integer durationMinutes;
    private String description;
    private String imageUrl;
    private String status;
}
