package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.dto.request.NailServiceUpdateRequest;
import com.example.booking_nail.dto.response.NailServiceResponse;
import com.example.booking_nail.service.NailServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class NailServiceController {
    private final NailServiceService nailServiceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NailServiceResponse createService(@RequestBody NailServiceCreationRequest request) {
        return nailServiceService.createRequest(request);
    }

    @GetMapping
    public List<NailServiceResponse> getAllServices() {
        return nailServiceService.getAllServices();
    }

    @GetMapping("/{id}")
    public NailServiceResponse getServiceById(@PathVariable Long id) {
        return nailServiceService.getServiceById(id);
    }

    @PutMapping("/{id}")
    public NailServiceResponse updateService(@PathVariable Long id,
                                             @RequestBody NailServiceUpdateRequest request) {
        return nailServiceService.updateService(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@PathVariable Long id) {
        nailServiceService.deleteService(id);
    }
}
