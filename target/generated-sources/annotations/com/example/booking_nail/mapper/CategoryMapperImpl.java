package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.CategoryRequest;
import com.example.booking_nail.dto.response.CategoryResponse;
import com.example.booking_nail.entity.Category;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-10-03T15:35:47+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 26.0.1 (Oracle Corporation)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public Category toEntity(CategoryRequest request) {
        if ( request == null ) {
            return null;
        }

        Category category = new Category();

        category.setName( request.getName() );
        category.setDescription( request.getDescription() );
        category.setStatus( request.getStatus() );

        return category;
    }

    @Override
    public CategoryResponse toResponse(Category category) {
        if ( category == null ) {
            return null;
        }

        CategoryResponse categoryResponse = new CategoryResponse();

        categoryResponse.setId( category.getId() );
        categoryResponse.setName( category.getName() );
        categoryResponse.setDescription( category.getDescription() );
        categoryResponse.setStatus( category.getStatus() );

        return categoryResponse;
    }

    @Override
    public void updateCategory(CategoryRequest request, Category category) {
        if ( request == null ) {
            return;
        }

        category.setName( request.getName() );
        category.setDescription( request.getDescription() );
        category.setStatus( request.getStatus() );
    }
}
