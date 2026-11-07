package com.example.booking_nail.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "categories")
@SQLDelete(sql = "UPDATE categories SET status = 'DELETED' WHERE id = ?")
@SQLRestriction("status <> 'DELETED'")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status;

    public Category(Long id, String name, String description, String status) {
        this.id = id;
        this.name = name;
        this.type = "SERVICE";
        this.description = description;
        this.status = status;
    }
}
