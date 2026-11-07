package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.CategoryRequest;
import com.example.booking_nail.dto.response.CategoryResponse;
import com.example.booking_nail.entity.Category;
import com.example.booking_nail.mapper.CategoryMapper;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import com.example.booking_nail.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final NailServiceRepository nailServiceRepository;
    private final CategoryMapper categoryMapper;
    private ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           NailServiceRepository nailServiceRepository,
                           CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.nailServiceRepository = nailServiceRepository;
        this.categoryMapper = categoryMapper;
    }

    @Autowired
    public void setProductRepository(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        validateRequest(request);
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw duplicateName();
        }
        return categoryMapper.toResponse(categoryRepository.save(categoryMapper.toEntity(request)));
    }

    public List<CategoryResponse> getAllCategories() {
        return getAllCategories(null);
    }

    public List<CategoryResponse> getAllCategories(String type) {
        List<Category> categories = (type != null && !type.isBlank())
                ? categoryRepository.findByTypeIgnoreCase(type.trim())
                : categoryRepository.findAll();
        return categories.stream().map(categoryMapper::toResponse).toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        return categoryMapper.toResponse(findCategoryById(id));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findCategoryById(id);
        validateRequest(request);
        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw duplicateName();
        }
        categoryMapper.updateCategory(request, category);
        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = findCategoryById(id);
        if (nailServiceRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete a category that has services");
        }
        if (productRepository != null && productRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot delete a category that has products");
        }
        categoryRepository.delete(category);
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found with id: " + id));
    }

    private void validateRequest(CategoryRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category name is required");
        }
        request.setName(request.getName().trim());

        if (request.getType() == null || request.getType().isBlank()) {
            request.setType("SERVICE");
        } else {
            String upper = request.getType().trim().toUpperCase(Locale.ROOT);
            if (!upper.equals("SERVICE") && !upper.equals("PRODUCT")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category type must be SERVICE or PRODUCT");
            }
            request.setType(upper);
        }

        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("ACTIVE");
        }
    }

    private ResponseStatusException duplicateName() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Category name already exists");
    }
}
