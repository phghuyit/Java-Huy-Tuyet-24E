package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.AppointmentCreationRequest;
import com.example.booking_nail.entity.Appointments;
import com.example.booking_nail.mapper.AppointmentMapper;
import com.example.booking_nail.repository.AppointmentsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
@RequestMapping("/api/appointment")
@Service @RequiredArgsConstructor
public class Appointment {
    private final AppointmentsRepository appointmentsRepository;
    private final AppointmentMapper appointmentMapper;
    @PostMapping
    public Appointments createRequest(AppointmentCreationRequest request){
        Appointments appointments= appointmentMapper.dtoToAppointment(request);
        return appointmentsRepository.save(appointments);
    }
    @GetMapping
    public List<Appointments> getAllAppointments(){
        return appointmentsRepository.findAll();
    }
}
