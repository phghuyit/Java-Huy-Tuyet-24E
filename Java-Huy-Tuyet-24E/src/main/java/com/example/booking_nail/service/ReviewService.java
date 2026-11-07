package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.ReviewRequest;
import com.example.booking_nail.dto.response.ReviewResponse;
import com.example.booking_nail.entity.Appointments;
import com.example.booking_nail.entity.Review;
import com.example.booking_nail.mapper.ReviewMapper;
import com.example.booking_nail.repository.AppointmentsRepository;
import com.example.booking_nail.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final AppointmentsRepository appointmentsRepository;

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found with id: " + id));
        return reviewMapper.toResponse(review);
    }

    public ReviewResponse getReviewByAppointmentId(Long appointmentId) {
        Review review = reviewRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No review found for appointment id: " + appointmentId));
        return reviewMapper.toResponse(review);
    }

    public List<ReviewResponse> getReviewsByStaffId(Long staffId) {
        return reviewRepository.findByStaffId(staffId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        return reviewRepository.findByUserId(userId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    public Double getAverageRatingByStaff(Long staffId) {
        List<Review> reviews = reviewRepository.findByStaffId(staffId);
        if (reviews.isEmpty()) {
            return 0.0;
        }
        double sum = 0;
        for (Review r : reviews) {
            if (r.getRating() != null) {
                sum += r.getRating();
            }
        }
        return Math.round((sum / reviews.size()) * 10.0) / 10.0;
    }

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        if (request.getAppointmentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã lịch hẹn không được để trống");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đánh giá phải từ 1 đến 5 sao");
        }

        if (reviewRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Lịch hẹn này đã được đánh giá trước đó");
        }

        Appointments appointment = appointmentsRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lịch hẹn với mã: " + request.getAppointmentId()));

        Review review = reviewMapper.toEntity(request);

        if (review.getUserId() == null) {
            review.setUserId(appointment.getCustomerId());
        }
        if (review.getStaffId() == null) {
            review.setStaffId(appointment.getStaffId());
        }

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toResponse(savedReview);
    }

    @Transactional
    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        Review existingReview = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found with id: " + id));

        if (request.getRating() != null && (request.getRating() < 1 || request.getRating() > 5)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5 stars");
        }

        if (request.getRating() != null) {
            existingReview.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            existingReview.setComment(request.getComment());
        }

        Review updatedReview = reviewRepository.save(existingReview);
        return reviewMapper.toResponse(updatedReview);
    }

    @Transactional
    public void deleteReview(Long id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found with id: " + id);
        }
        reviewRepository.deleteById(id);
    }
}
