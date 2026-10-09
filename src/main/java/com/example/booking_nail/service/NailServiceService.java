package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.dto.request.NailServiceUpdateRequest;
import com.example.booking_nail.dto.response.NailServiceResponse;
import com.example.booking_nail.mapper.NailServiceMapper;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.repository.NailServiceRepository;
import com.example.booking_nail.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class NailServiceService {
    private final NailServiceRepository nailServiceRepository;
    private final NailServiceMapper nailServiceMapper;
    private final CategoryRepository categoryRepository;

    public NailServiceService(NailServiceRepository nailServiceRepository,
                              NailServiceMapper nailServiceMapper,
                              CategoryRepository categoryRepository) {
        this.nailServiceRepository = nailServiceRepository;
        this.nailServiceMapper = nailServiceMapper;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public NailServiceResponse createRequest(NailServiceCreationRequest request) {
        request.setName(validateServiceFields(request.getName(), request.getPrice(), request.getDurationMinutes()));
        request.setStatus(validateStatus(request.getStatus()));
        validateOptionalFields(request.getDescription(), request.getImageUrl());
        validateCategory(request.getCategoryId());
        if (nailServiceRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nail service name already exists");
        }
        NailService nailService = nailServiceMapper.dtoToNailService(request);
        return nailServiceMapper.toResponse(nailServiceRepository.save(nailService));
    }

    public List<NailServiceResponse> getAllServices() {
        return nailServiceRepository.findAll().stream()
                .map(nailServiceMapper::toResponse)
                .toList();
    }

    public NailServiceResponse getServiceById(Long id) {
        return nailServiceMapper.toResponse(findServiceById(id));
    }

    @Transactional
    public NailServiceResponse updateService(Long id, NailServiceUpdateRequest request) {
        NailService nailService = findServiceById(id);
        request.setName(validateServiceFields(request.getName(), request.getPrice(), request.getDurationMinutes()));
        request.setStatus(validateStatus(request.getStatus()));
        validateOptionalFields(request.getDescription(), request.getImageUrl());
        validateCategory(request.getCategoryId());
        if (nailServiceRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nail service name already exists");
        }
        nailServiceMapper.updateNailService(request, nailService);
        return nailServiceMapper.toResponse(nailServiceRepository.save(nailService));
    }

    @Transactional
    public void deleteService(Long id) {
        nailServiceRepository.delete(findServiceById(id));
    }

    private String validateServiceFields(String name, Double price, Integer durationMinutes) {
        if (name == null || name.strip().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nail service name is required");
        }
        name = name.strip();
        if (name.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nail service name must not exceed 255 characters");
        }
        if (price == null || !Double.isFinite(price) || price < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price is required and must be non-negative");
        }
        if (durationMinutes == null || durationMinutes <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration minutes is required and must be positive");
        }
        return name;
    }

    private String validateStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }
        status = status.strip().toUpperCase(Locale.ROOT);
        if (!status.equals("ACTIVE") && !status.equals("INACTIVE")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status must be ACTIVE or INACTIVE");
        }
        return status;
    }

    private void validateOptionalFields(String description, String imageUrl) {
        if (description != null && description.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description must not exceed 255 characters");
        }
        if (imageUrl != null && imageUrl.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image URL must not exceed 255 characters");
        }
    }

    private void validateCategory(Long categoryId) {
        if (categoryId == null || categoryId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category id is required and must be positive");
        }
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found with id: " + categoryId);
        }
    }

    private NailService findServiceById(Long id) {
        if (id == null || id <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Service id must be positive");
        }
        return nailServiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Nail service not found with id: " + id));
    }
}
