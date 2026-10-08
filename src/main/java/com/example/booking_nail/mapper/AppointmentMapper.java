package com.example.booking_nail.mapper;


import com.example.booking_nail.dto.request.AppointmentCreationRequest;
import com.example.booking_nail.entity.Appointments;
import org.mapstruct.Mapper;

@Mapper(componentModel= "spring")
public interface AppointmentMapper {
    Appointments dtoToAppointment(AppointmentCreationRequest appointmentCreationRequest);
}
