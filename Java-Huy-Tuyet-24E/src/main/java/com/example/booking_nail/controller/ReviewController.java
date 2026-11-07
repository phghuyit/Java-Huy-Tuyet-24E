package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.ReviewRequest;
import com.example.booking_nail.dto.response.ReviewResponse;
import com.example.booking_nail.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public List<ReviewResponse> getAllReviews(
            @RequestParam(required = false) Long staffId,
            @RequestParam(required = false) Long userId) {
        if (staffId != null) {
            return reviewService.getReviewsByStaffId(staffId);
        }
        if (userId != null) {
            return reviewService.getReviewsByUserId(userId);
        }
        return reviewService.getAllReviews();
    }

    @GetMapping("/{id}")
    public ReviewResponse getReviewById(@PathVariable Long id) {
        return reviewService.getReviewById(id);
    }

    @GetMapping("/appointment/{appointmentId}")
    public ReviewResponse getReviewByAppointmentId(@PathVariable Long appointmentId) {
        return reviewService.getReviewByAppointmentId(appointmentId);
    }

    @GetMapping("/staff/{staffId}/average")
    public Double getAverageRatingByStaff(@PathVariable Long staffId) {
        return reviewService.getAverageRatingByStaff(staffId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse createReview(@RequestBody ReviewRequest request) {
        return reviewService.createReview(request);
    }

    @PutMapping("/{id}")
    public ReviewResponse updateReview(@PathVariable Long id, @RequestBody ReviewRequest request) {
        return reviewService.updateReview(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
    }
}
