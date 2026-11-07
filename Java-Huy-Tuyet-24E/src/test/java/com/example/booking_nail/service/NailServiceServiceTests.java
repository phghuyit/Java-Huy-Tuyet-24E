package com.example.booking_nail.service;

import com.example.booking_nail.dto.response.NailServiceResponse;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.mapper.NailServiceMapper;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NailServiceServiceTests {

    private NailServiceRepository nailServiceRepository;
    private NailServiceMapper nailServiceMapper;
    private CategoryRepository categoryRepository;
    private NailServiceService nailServiceService;

    @BeforeEach
    void setUp() {
        nailServiceRepository = mock(NailServiceRepository.class);
        nailServiceMapper = mock(NailServiceMapper.class);
        categoryRepository = mock(CategoryRepository.class);

        nailServiceService = new NailServiceService(
                nailServiceRepository,
                nailServiceMapper,
                categoryRepository
        );
    }

    @Test
    void getServiceBySlug_Success() {
        String slug = "signature-balayage";
        NailService service = new NailService(1L, 2L, "Nhuộm Balayage VELA", slug, 1800000.0, 90, "Mô tả", "/placeholder.svg", "ACTIVE");
        NailServiceResponse response = new NailServiceResponse();
        response.setId(1L);
        response.setName("Nhuộm Balayage VELA");
        response.setSlug(slug);

        when(nailServiceRepository.findBySlug(slug)).thenReturn(Optional.of(service));
        when(nailServiceMapper.toResponse(service)).thenReturn(response);

        NailServiceResponse result = nailServiceService.getServiceBySlug(slug);

        assertNotNull(result);
        assertEquals("signature-balayage", result.getSlug());
        assertEquals("Nhuộm Balayage VELA", result.getName());
    }

    @Test
    void getServiceBySlug_NotFound() {
        when(nailServiceRepository.findBySlug("unknown-slug")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> nailServiceService.getServiceBySlug("unknown-slug"));
    }

    @Test
    void toSlug_NormalizesVietnameseDiacritics() {
        assertEquals("son-gel", NailServiceService.toSlug("Sơn gel"));
        assertEquals("cat-toc-thiet-ke", NailServiceService.toSlug("Cắt tóc thiết kế"));
        assertEquals("dap-mong-gel", NailServiceService.toSlug("Đắp móng gel"));
    }

    @Test
    void updateService_UpdatesCategoryIdSuccessfully() {
        com.example.booking_nail.dto.request.NailServiceUpdateRequest request = new com.example.booking_nail.dto.request.NailServiceUpdateRequest();
        request.setName("Sơn gel cơ bản");
        request.setPrice(150000.0);
        request.setDurationMinutes(45);
        request.setCategoryId(2L);
        request.setStatus("ACTIVE");

        NailService existing = new NailService(10L, 1L, "Sơn gel cơ bản", "son-gel-co-ban", 150000.0, 45, "Mô tả", "/img.jpg", "ACTIVE");

        when(nailServiceRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(categoryRepository.existsById(2L)).thenReturn(true);
        when(nailServiceRepository.existsByNameIgnoreCaseAndIdNot("Sơn gel cơ bản", 10L)).thenReturn(false);
        when(nailServiceRepository.save(existing)).thenAnswer(invocation -> invocation.getArgument(0));

        NailServiceResponse mockResponse = new NailServiceResponse();
        mockResponse.setId(10L);
        mockResponse.setCategoryId(2L);
        mockResponse.setName("Sơn gel cơ bản");
        when(nailServiceMapper.toResponse(any(NailService.class))).thenReturn(mockResponse);

        doAnswer(invocation -> {
            com.example.booking_nail.dto.request.NailServiceUpdateRequest req = invocation.getArgument(0);
            NailService target = invocation.getArgument(1);
            target.setCategoryId(req.getCategoryId());
            return null;
        }).when(nailServiceMapper).updateNailService(eq(request), eq(existing));

        NailServiceResponse result = nailServiceService.updateService(10L, request);

        assertNotNull(result);
        assertEquals(2L, result.getCategoryId());
        assertEquals(2L, existing.getCategoryId());
        verify(categoryRepository).existsById(2L);
        verify(nailServiceRepository).save(existing);
    }
}
