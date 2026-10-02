package com.example.booking_nail.service;

import com.example.booking_nail.model.NailServices;
import com.example.booking_nail.repository.NailServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NailService {
    @Autowired
    private NailServiceRepository nailServiceRepository;

    public NailServices createRequest(Object request){
        
    }


}
