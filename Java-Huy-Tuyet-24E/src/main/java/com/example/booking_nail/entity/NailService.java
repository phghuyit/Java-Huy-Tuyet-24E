package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name="nailService")
@SQLDelete(sql = "UPDATE nail_service SET status = 'DELETED' WHERE id = ?")
@SQLRestriction("status <> 'DELETED'")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class NailService {
    @Id
    @GeneratedValue (strategy= GenerationType.IDENTITY)
    private Long id;
    private Long categoryId;
    private String name;

    @Column(unique = true)
    private String slug;

    private Double price;
    private Integer durationMinutes;
    private String description;
    private String imageUrl;
    private String status;

    public NailService(Long id, Long categoryId, String name, Double price, Integer durationMinutes, String description, String imageUrl, String status) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.price = price;
        this.durationMinutes = durationMinutes;
        this.description = description;
        this.imageUrl = imageUrl;
        this.status = status;
    }
}
