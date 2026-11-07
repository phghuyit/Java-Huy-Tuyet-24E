package com.example.booking_nail.repository;

import com.example.booking_nail.entity.WaitlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WaitlistRepository extends JpaRepository<WaitlistEntry, Long> {
    List<WaitlistEntry> findByStatus(String status);
    List<WaitlistEntry> findByDesiredDate(LocalDate desiredDate);
    List<WaitlistEntry> findByCustomerId(Long customerId);
    List<WaitlistEntry> findByStaffId(Long staffId);
}
