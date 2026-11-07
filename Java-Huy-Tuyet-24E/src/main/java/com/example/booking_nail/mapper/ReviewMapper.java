package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.ReviewRequest;
import com.example.booking_nail.dto.response.ReviewResponse;
import com.example.booking_nail.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Review toEntity(ReviewRequest request);

    ReviewResponse toResponse(Review review);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateReview(ReviewRequest request, @MappingTarget Review review);
}
