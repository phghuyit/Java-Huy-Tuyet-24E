package com.example.booking_nail.repository;

import com.example.booking_nail.entity.AppointmentServices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentServicesRepository extends JpaRepository<AppointmentServices,Long> {
}
