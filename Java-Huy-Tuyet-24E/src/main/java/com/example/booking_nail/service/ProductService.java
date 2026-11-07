package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.ProductRequest;
import com.example.booking_nail.dto.response.ProductResponse;
import com.example.booking_nail.entity.Product;
import com.example.booking_nail.mapper.ProductMapper;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateRequest(request, null);

        if (productRepository.existsBySkuIgnoreCase(request.getSku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product SKU already exists: " + request.getSku());
        }

        Product product = productMapper.toEntity(request);
        return productMapper.toResponse(productRepository.save(product));
    }

    public List<ProductResponse> getAllProducts(Long categoryId) {
        List<Product> products = (categoryId != null && categoryId > 0)
                ? productRepository.findByCategoryId(categoryId)
                : productRepository.findAll();

        return products.stream()
                .map(productMapper::toResponse)
                .toList();
    }

    public ProductResponse getProductById(Long id) {
        return productMapper.toResponse(findProductById(id));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProductById(id);
        validateRequest(request, id);

        if (productRepository.existsBySkuIgnoreCaseAndIdNot(request.getSku(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Product SKU already exists: " + request.getSku());
        }

        productMapper.updateProduct(request, product);
        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = findProductById(id);
        productRepository.delete(product);
    }

    private Product findProductById(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product id must be positive");
        }
        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + id));
    }

    private void validateRequest(ProductRequest request, Long currentId) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product request body cannot be null");
        }

        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required");
        }
        request.setName(request.getName().trim());

        if (request.getSku() == null || request.getSku().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product SKU is required");
        }
        request.setSku(request.getSku().trim().toUpperCase(Locale.ROOT));

        if (request.getCategoryId() != null && request.getCategoryId() > 0) {
            if (!categoryRepository.existsById(request.getCategoryId())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found with id: " + request.getCategoryId());
            }
        }

        if (request.getSalePrice() != null && request.getSalePrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sale price cannot be negative");
        }

        if (request.getCostPrice() != null && request.getCostPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cost price cannot be negative");
        }

        if (request.getStockQuantity() != null && request.getStockQuantity() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock quantity cannot be negative");
        }

        if (request.getMinStock() != null && request.getMinStock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum stock cannot be negative");
        }

        if (request.getStatus() == null || request.getStatus().trim().isBlank()) {
            request.setStatus("ACTIVE");
        } else {
            request.setStatus(request.getStatus().trim().toUpperCase(Locale.ROOT));
        }

        if (request.getIsForSale() == null) {
            request.setIsForSale(true);
        }
    }
}
