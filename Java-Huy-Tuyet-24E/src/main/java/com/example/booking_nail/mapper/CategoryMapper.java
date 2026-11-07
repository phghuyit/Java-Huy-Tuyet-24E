package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.CategoryRequest;
import com.example.booking_nail.dto.response.CategoryResponse;
import com.example.booking_nail.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    @Mapping(target = "id", ignore = true)
    Category toEntity(CategoryRequest request);

    CategoryResponse toResponse(Category category);

    @Mapping(target = "id", ignore = true)
    void updateCategory(CategoryRequest request, @MappingTarget Category category);
}
