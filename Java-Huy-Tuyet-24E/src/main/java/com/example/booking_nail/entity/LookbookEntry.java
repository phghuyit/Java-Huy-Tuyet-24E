package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "lookbook_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LookbookEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "category_slug")
    private String categorySlug;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "staff_id")
    private Long staffId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
