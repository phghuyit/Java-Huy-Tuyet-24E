package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.ProductRequest;
import com.example.booking_nail.dto.response.ProductResponse;
import com.example.booking_nail.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "id", ignore = true)
    Product toEntity(ProductRequest request);

    ProductResponse toResponse(Product product);

    @Mapping(target = "id", ignore = true)
    void updateProduct(ProductRequest request, @MappingTarget Product product);
}
