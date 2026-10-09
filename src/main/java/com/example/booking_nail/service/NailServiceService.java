package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.mapper.NailServiceMapper;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.repository.NailServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service @RequiredArgsConstructor
public class NailServiceService {
    private final NailServiceRepository nailServiceRepository;

    private final NailServiceMapper nailServiceMapper;

    public NailService createRequest(NailServiceCreationRequest request){
        NailService nailService = nailServiceMapper.dtoToNailService(request);
        return nailServiceRepository.save(nailService);
    }

    public List<NailService> getAllNailServices(){
        return nailServiceRepository.findAll();
    }

    public NailService getNailService(Long id){
        return nailServiceRepository.findById(id).orElseThrow(()->new RuntimeException("Khong tim thay dich vu nai co so id: "+id));
    }
}
