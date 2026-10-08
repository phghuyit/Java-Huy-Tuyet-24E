package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.service.NailServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class NailServiceController {
    private final NailServiceService nailServiceService;

    @PostMapping("/create")
    public NailService createNailService(@RequestBody NailServiceCreationRequest request){
        return nailServiceService.createRequest(request);
    }
}

