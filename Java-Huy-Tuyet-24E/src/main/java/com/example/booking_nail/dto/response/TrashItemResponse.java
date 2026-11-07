package com.example.booking_nail.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrashItemResponse {
    private String id;
    private Long originalId;
    private String name;
    private String category;
    private String categoryLabel;
    private String sku;
    private String details;
    private String deletedBy;
    private String deletedAt;
}
