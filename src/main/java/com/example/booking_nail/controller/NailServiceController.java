package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.dto.request.NailServiceUpdateRequest;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.service.NailServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class NailServiceController {
    private final NailServiceService nailServiceService;

    @PostMapping
    public NailService createNailService(@RequestBody NailServiceCreationRequest request){
        return nailServiceService.createRequest(request);
    }

    @GetMapping
    public List<NailService> getAllNailServices(){
        return nailServiceService.getAllNailServices();
    }

    @GetMapping("/{nailServiceId}")
    public NailService getNailService(@PathVariable("nailServiceId") Long id){
        return nailServiceService.getNailService(id);
    }

    @PutMapping("/{nailServiceId}")
    public NailService updateNailService(@PathVariable("nailServiceId") Long id, @RequestBody NailServiceUpdateRequest request){
        return nailServiceService.updateNailService(id,request);
    }

    @DeleteMapping("/{nailServiceId}")
    public String deleteNailService(@PathVariable("nailServiceId") Long id){
        nailServiceService.deleteNailService(id);
        return "Dich vu nail da xoa thanh cong";
    }
}

