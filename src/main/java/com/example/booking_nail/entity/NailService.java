package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name="nailService")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
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
