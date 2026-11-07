package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.AppointmentCreationRequest;
import com.example.booking_nail.dto.response.AppointmentResponse;
import com.example.booking_nail.entity.Appointments;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AppointmentMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Appointments dtoToAppointment(AppointmentCreationRequest appointmentCreationRequest);

    AppointmentResponse toResponse(Appointments appointment);
}
