package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.NailServiceCreationRequest;
import com.example.booking_nail.dto.request.NailServiceUpdateRequest;
import com.example.booking_nail.dto.response.NailServiceResponse;
import com.example.booking_nail.entity.NailService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface NailServiceMapper {
    @Mapping(target = "id", ignore = true)
    NailService dtoToNailService(NailServiceCreationRequest request);

    NailServiceResponse toResponse(NailService nailService);

    @Mapping(target = "id", ignore = true)
    void updateNailService(NailServiceUpdateRequest request, @MappingTarget NailService nailService);
}
