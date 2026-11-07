package com.example.booking_nail.repository;

import com.example.booking_nail.entity.AppointmentServices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentServicesRepository extends JpaRepository<AppointmentServices, Long> {
    List<AppointmentServices> findByAppointmentId(Long appointmentId);
    void deleteByAppointmentId(Long appointmentId);
}
