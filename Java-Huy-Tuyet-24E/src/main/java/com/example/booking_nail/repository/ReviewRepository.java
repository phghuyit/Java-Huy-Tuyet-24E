package com.example.booking_nail.repository;

import com.example.booking_nail.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByAppointmentId(Long appointmentId);

    boolean existsByAppointmentId(Long appointmentId);

    List<Review> findByStaffId(Long staffId);

    List<Review> findByUserId(Long userId);

    List<Review> findByRating(Integer rating);
}
