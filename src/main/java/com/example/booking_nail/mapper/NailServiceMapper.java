package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.model.NailService;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NailServiceMapper {
    NailService dtoToNailService(NailServiceCreationRequest nailServiceCreationRequest);
}
