package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.mapper.NailServiceMapper;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.repository.NailServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class NailServiceService {
    private final NailServiceRepository nailServiceRepository;

    private final NailServiceMapper nailServiceMapper;

    public NailService createRequest(NailServiceCreationRequest request){
        NailService nailService = nailServiceMapper.dtoToNailService(request);
        return nailServiceRepository.save(nailService);
    }

}
