package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.AppointmentCreationRequest;
import com.example.booking_nail.entity.Appointments;
import com.example.booking_nail.mapper.AppointmentMapper;
import com.example.booking_nail.repository.AppointmentsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class Appointment {
    private final AppointmentsRepository appointmentsRepository;
    private final AppointmentMapper appointmentMapper;

    public Appointments createRequest(AppointmentCreationRequest request){
        Appointments appointments= appointmentMapper.dtoToAppointment(request);
        return appointmentsRepository.save(appointments);
    }
}
