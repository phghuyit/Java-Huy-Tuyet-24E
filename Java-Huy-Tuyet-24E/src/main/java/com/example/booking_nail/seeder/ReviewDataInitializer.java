package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Appointments;
import com.example.booking_nail.entity.Review;
import com.example.booking_nail.repository.AppointmentsRepository;
import com.example.booking_nail.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(8)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class ReviewDataInitializer implements CommandLineRunner {

    private final ReviewRepository reviewRepository;
    private final AppointmentsRepository appointmentsRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (reviewRepository.count() > 0) {
            return;
        }

        List<Appointments> completedAppointments = appointmentsRepository.findAll().stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .toList();

        for (Appointments appt : completedAppointments) {
            if (!reviewRepository.existsByAppointmentId(appt.getId())) {
                Review review = new Review();
                review.setAppointmentId(appt.getId());
                review.setUserId(appt.getCustomerId());
                review.setStaffId(appt.getStaffId());
                review.setRating(5);
                review.setComment("Dịch vụ tại VELA rất tuyệt vời! Nhân viên nhiệt tình, tư vấn chu đáo và làm rất êm tay. Chắc chắn sẽ quay lại!");
                review.setCreatedAt(LocalDateTime.now().minusHours(2));
                reviewRepository.save(review);
            }
        }
    }
}
