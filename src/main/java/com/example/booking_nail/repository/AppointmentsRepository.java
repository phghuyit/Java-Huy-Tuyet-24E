package com.example.booking_nail.repository;

import com.example.booking_nail.entity.Appointments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentsRepository extends JpaRepository<Appointments,Long> {
}
