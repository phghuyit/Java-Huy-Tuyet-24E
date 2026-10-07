package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.CategoryRequest;
import com.example.booking_nail.entity.Category;
import com.example.booking_nail.mapper.CategoryMapper;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CategoryServiceTests {
    private CategoryRepository categoryRepository;
    private NailServiceRepository nailServiceRepository;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        nailServiceRepository = mock(NailServiceRepository.class);
        categoryService = new CategoryService(categoryRepository, nailServiceRepository, mock(CategoryMapper.class));
    }

    @Test
    void cannotDeleteCategoryWithServices() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(new Category()));
        when(nailServiceRepository.existsByCategoryId(1L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> categoryService.deleteCategory(1L));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    void deletesUnusedCategory() {
        Category category = new Category();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        categoryService.deleteCategory(1L);

        verify(categoryRepository).delete(category);
    }

    @Test
    void missingCategoryReturnsNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> categoryService.getCategoryById(99L));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void rejectsBlankCategoryName() {
        CategoryRequest request = new CategoryRequest();
        request.setName("   ");

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> categoryService.createCategory(request));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void rejectsDuplicateNameAfterTrimming() {
        CategoryRequest request = new CategoryRequest();
        request.setName("  Làm nail  ");
        when(categoryRepository.existsByNameIgnoreCase("Làm nail")).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> categoryService.createCategory(request));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void rejectsMissingName() {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
                () -> categoryService.createCategory(new CategoryRequest()));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        verify(categoryRepository, never()).save(any(Category.class));
    }
}
