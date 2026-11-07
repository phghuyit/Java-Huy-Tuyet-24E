package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.WaitlistRequest;
import com.example.booking_nail.dto.response.WaitlistResponse;
import com.example.booking_nail.entity.WaitlistEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WaitlistMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    WaitlistEntry toEntity(WaitlistRequest request);

    WaitlistResponse toResponse(WaitlistEntry entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(WaitlistRequest request, @MappingTarget WaitlistEntry entity);
}
