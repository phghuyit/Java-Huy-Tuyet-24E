package com.example.booking_nail.dto.response;

import com.example.booking_nail.entity.LookbookEntry;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LookbookResponse {
    private Long id;
    private String title;
    private String categorySlug;
    private String imageUrl;
    private Long serviceId;
    private Long staffId;
    private String description;
    private String createdAt;

    public static LookbookResponse from(LookbookEntry entry) {
        return new LookbookResponse(
                entry.getId(),
                entry.getTitle(),
                entry.getCategorySlug(),
                entry.getImageUrl(),
                entry.getServiceId(),
                entry.getStaffId(),
                entry.getDescription(),
                entry.getCreatedAt() != null ? entry.getCreatedAt().toString() : null
        );
    }
}
