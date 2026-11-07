package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.ProductRequest;
import com.example.booking_nail.dto.response.ProductResponse;
import com.example.booking_nail.entity.Product;
import com.example.booking_nail.mapper.ProductMapper;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductServiceTests {
    private ProductRepository productRepository;
    private CategoryRepository categoryRepository;
    private ProductMapper productMapper;
    private ProductService productService;

    @BeforeEach
    void setUp() {
        productRepository = mock(ProductRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        productMapper = mock(ProductMapper.class);
        productService = new ProductService(productRepository, categoryRepository, productMapper);
    }

    @Test
    void createProductSuccess() {
        ProductRequest request = new ProductRequest();
        request.setName("Sơn gel OPI");
        request.setSku("SKU-OPI-01");
        request.setCategoryId(1L);
        request.setSalePrice(BigDecimal.valueOf(150000));
        request.setStockQuantity(20);

        Product entity = new Product();
        Product saved = new Product();
        saved.setId(10L);
        ProductResponse response = new ProductResponse();
        response.setId(10L);
        response.setName("Sơn gel OPI");

        when(categoryRepository.existsById(1L)).thenReturn(true);
        when(productRepository.existsBySkuIgnoreCase("SKU-OPI-01")).thenReturn(false);
        when(productMapper.toEntity(request)).thenReturn(entity);
        when(productRepository.save(entity)).thenReturn(saved);
        when(productMapper.toResponse(saved)).thenReturn(response);

        ProductResponse result = productService.createProduct(request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(productRepository).save(entity);
    }

    @Test
    void rejectsDuplicateSku() {
        ProductRequest request = new ProductRequest();
        request.setName("Sơn móng");
        request.setSku("SKU-DUP");

        when(productRepository.existsBySkuIgnoreCase("SKU-DUP")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> productService.createProduct(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void rejectsMissingNameOrSku() {
        ProductRequest requestWithoutName = new ProductRequest();
        requestWithoutName.setSku("SKU-01");

        assertThrows(ResponseStatusException.class, () -> productService.createProduct(requestWithoutName));

        ProductRequest requestWithoutSku = new ProductRequest();
        requestWithoutSku.setName("Product Name");

        assertThrows(ResponseStatusException.class, () -> productService.createProduct(requestWithoutSku));
    }

    @Test
    void missingProductReturnsNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> productService.getProductById(99L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }
}
