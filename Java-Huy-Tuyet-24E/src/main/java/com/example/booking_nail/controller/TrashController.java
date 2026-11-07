package com.example.booking_nail.controller;

import com.example.booking_nail.dto.response.TrashItemResponse;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import com.example.booking_nail.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/trash")
@RequiredArgsConstructor
public class TrashController {

    private final ProductRepository productRepository;
    private final NailServiceRepository nailServiceRepository;
    private final CategoryRepository categoryRepository;

    @GetMapping
    public List<TrashItemResponse> getAll(@RequestParam(required = false, defaultValue = "all") String categoryFilter) {
        List<TrashItemResponse> result = new ArrayList<>();
        String nowStr = LocalDateTime.now().toString();

        if ("all".equalsIgnoreCase(categoryFilter) || "inventory".equalsIgnoreCase(categoryFilter)) {
            var products = productRepository.findDeletedProducts();
            for (var p : products) {
                result.add(new TrashItemResponse(
                        "prod-" + p.getId(),
                        p.getId(),
                        p.getName(),
                        "inventory",
                        "Kho sơn gel & Vật tư",
                        p.getSku() != null ? p.getSku() : "",
                        "Đơn vị: " + (p.getUnit() != null ? p.getUnit() : "Chai") + " · Tồn kho: " + (p.getStockQuantity() != null ? p.getStockQuantity() : 0),
                        "Quản trị viên",
                        nowStr
                ));
            }
        }

        if ("all".equalsIgnoreCase(categoryFilter) || "service".equalsIgnoreCase(categoryFilter)) {
            var services = nailServiceRepository.findDeletedServices();
            for (var s : services) {
                result.add(new TrashItemResponse(
                        "svc-" + s.getId(),
                        s.getId(),
                        s.getName(),
                        "service",
                        "Dịch vụ làm đẹp",
                        s.getSlug() != null ? s.getSlug() : "",
                        "Thời lượng: " + (s.getDurationMinutes() != null ? s.getDurationMinutes() : 45) + " phút",
                        "Quản trị viên",
                        nowStr
                ));
            }
        }

        if ("all".equalsIgnoreCase(categoryFilter) || "category".equalsIgnoreCase(categoryFilter)) {
            var cats = categoryRepository.findDeletedCategories();
            for (var c : cats) {
                result.add(new TrashItemResponse(
                        "cat-" + c.getId(),
                        c.getId(),
                        c.getName(),
                        "category",
                        "Danh mục",
                        "",
                        "Loại: " + (c.getType() != null ? c.getType() : "Dịch vụ"),
                        "Quản trị viên",
                        nowStr
                ));
            }
        }

        return result;
    }

    @PostMapping("/restore/{type}/{id}")
    @Transactional
    public void restore(@PathVariable String type, @PathVariable Long id) {
        switch (type.toLowerCase()) {
            case "inventory" -> productRepository.restoreProduct(id);
            case "service" -> nailServiceRepository.restoreService(id);
            case "category" -> categoryRepository.restoreCategory(id);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại mục không hợp lệ: " + type);
        }
    }

    @DeleteMapping("/{type}/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void purge(@PathVariable String type, @PathVariable Long id) {
        switch (type.toLowerCase()) {
            case "inventory" -> productRepository.purgeProduct(id);
            case "service" -> nailServiceRepository.purgeService(id);
            case "category" -> categoryRepository.purgeCategory(id);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Loại mục không hợp lệ: " + type);
        }
    }
}
