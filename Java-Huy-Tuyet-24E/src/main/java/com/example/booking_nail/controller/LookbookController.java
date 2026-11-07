package com.example.booking_nail.controller;

import com.example.booking_nail.dto.response.LookbookResponse;
import com.example.booking_nail.entity.LookbookEntry;
import com.example.booking_nail.repository.LookbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lookbook")
@RequiredArgsConstructor
public class LookbookController {

    private final LookbookRepository lookbookRepository;

    @GetMapping
    public List<LookbookResponse> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long staffId,
            @RequestParam(required = false) Long serviceId) {

        List<LookbookEntry> list;
        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            list = lookbookRepository.findByCategorySlug(category.toLowerCase());
        } else if (staffId != null) {
            list = lookbookRepository.findByStaffId(staffId);
        } else if (serviceId != null) {
            list = lookbookRepository.findByServiceId(serviceId);
        } else {
            list = lookbookRepository.findAll();
        }
        return list.stream().map(LookbookResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LookbookResponse create(@RequestBody LookbookEntry entry) {
        return LookbookResponse.from(lookbookRepository.save(entry));
    }
}
