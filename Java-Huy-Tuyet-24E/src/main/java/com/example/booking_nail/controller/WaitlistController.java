package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.WaitlistRequest;
import com.example.booking_nail.dto.response.WaitlistResponse;
import com.example.booking_nail.service.WaitlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/waitlist")
@RequiredArgsConstructor
public class WaitlistController {

    private final WaitlistService waitlistService;

    @GetMapping
    public List<WaitlistResponse> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long customerId) {
        return waitlistService.getAll(status, date, customerId);
    }

    @GetMapping("/{id}")
    public WaitlistResponse getById(@PathVariable Long id) {
        return waitlistService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaitlistResponse create(@RequestBody WaitlistRequest request) {
        return waitlistService.create(request);
    }

    @PutMapping("/{id}")
    public WaitlistResponse update(@PathVariable Long id, @RequestBody WaitlistRequest request) {
        return waitlistService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        waitlistService.delete(id);
    }
}
