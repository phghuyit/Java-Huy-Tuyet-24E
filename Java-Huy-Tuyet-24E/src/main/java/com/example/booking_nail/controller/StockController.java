package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.StockRequest;
import com.example.booking_nail.dto.response.StockResponse;
import com.example.booking_nail.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/stocks", "/api/inventory/transactions"})
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    public List<StockResponse> getAll(@RequestParam(required = false) Long productId) {
        return stockService.getAll(productId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockResponse create(@RequestBody StockRequest request) {
        return stockService.create(request);
    }
}
