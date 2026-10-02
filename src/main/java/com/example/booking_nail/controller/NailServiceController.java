package com.example.booking_nail.controller;

import com.example.booking_nail.model.NailService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class NailServiceController {

    private static final List<NailService> SERVICES = List.of(
            new NailService(1L, 1L, "Sơn gel trơn", 150000.0, 45, "Sơn gel màu trơn cao cấp, bền màu", "https://example.com/images/son-gel.jpg", "ACTIVE"),
            new NailService(2L, 1L, "Sơn gel mắt mèo", 200000.0, 60, "Sơn gel hiệu ứng mắt mèo lấp lánh", "https://example.com/images/mat-meo.jpg", "ACTIVE"),
            new NailService(3L, 2L, "Đắp móng bột", 350000.0, 90, "Đắp móng bột dáng dài kèm phom chuẩn", "https://example.com/images/dap-bot.jpg", "ACTIVE"),
            new NailService(4L, 2L, "Đắp gel ẩn hoa/xà cừ", 400000.0, 90, "Đắp gel tự nhiên ẩn hoa khô hoặc xà cừ", "https://example.com/images/dap-gel.jpg", "ACTIVE"),
            new NailService(5L, 3L, "Chăm sóc móng cơ bản", 100000.0, 30, "Cắt da, dũa tạo phom, dưỡng móng", "https://example.com/images/cham-soc.jpg", "ACTIVE")
    );

    @GetMapping
    public List<NailService> getAllServices() {
        return SERVICES;
    }

    @GetMapping("/{id}")
    public NailService getServiceById(@PathVariable Long id) {
        return SERVICES.stream()
                .filter(service -> service.getId().equals(id))
                .findFirst()
                .orElse(null);
    }
}

