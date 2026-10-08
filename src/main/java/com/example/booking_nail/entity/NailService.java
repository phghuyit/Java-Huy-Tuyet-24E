package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "nailServices")
public class NailService {
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
