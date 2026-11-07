package com.example.booking_nail.repository;

import com.example.booking_nail.entity.AppointmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentStatusHistoryRepository extends JpaRepository<AppointmentStatusHistory, Long> {
    List<AppointmentStatusHistory> findByAppointmentIdOrderByCreatedAtDesc(Long appointmentId);
    void deleteByAppointmentId(Long appointmentId);
}
