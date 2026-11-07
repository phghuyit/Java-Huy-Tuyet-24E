package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.CouponRequest;
import com.example.booking_nail.dto.request.CouponValidationRequest;
import com.example.booking_nail.dto.response.CouponResponse;
import com.example.booking_nail.dto.response.CouponValidationResponse;
import com.example.booking_nail.entity.Coupon;
import com.example.booking_nail.mapper.CouponMapper;
import com.example.booking_nail.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAll()
                .stream()
                .map(couponMapper::toResponse)
                .toList();
    }

    public List<CouponResponse> getActiveCoupons() {
        return couponRepository.findByActiveTrue()
                .stream()
                .map(couponMapper::toResponse)
                .toList();
    }

    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found with id: " + id));
        return couponMapper.toResponse(coupon);
    }

    public CouponResponse getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found with code: " + code));
        return couponMapper.toResponse(coupon);
    }

    public CouponValidationResponse validateCoupon(CouponValidationRequest request) {
        if (request == null || request.getCode() == null || request.getCode().trim().isBlank()) {
            return new CouponValidationResponse(false, null, null, null,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, "Mã giảm giá không được để trống.");
        }

        BigDecimal orderAmount = request.getOrderAmount() != null ? request.getOrderAmount() : BigDecimal.ZERO;
        String normalizedCode = request.getCode().trim().toUpperCase();

        Optional<Coupon> optCoupon = couponRepository.findByCode(normalizedCode);
        if (optCoupon.isEmpty()) {
            return new CouponValidationResponse(false, normalizedCode, null, null,
                    orderAmount, BigDecimal.ZERO, orderAmount, "Mã giảm giá không tồn tại.");
        }

        Coupon coupon = optCoupon.get();

        if (Boolean.FALSE.equals(coupon.getActive())) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(),
                    orderAmount, BigDecimal.ZERO, orderAmount, "Mã giảm giá hiện đang bị vô hiệu hóa.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartAt() != null && now.isBefore(coupon.getStartAt())) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(),
                    orderAmount, BigDecimal.ZERO, orderAmount, "Mã giảm giá chưa đến thời điểm áp dụng.");
        }
        if (coupon.getEndAt() != null && now.isAfter(coupon.getEndAt())) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(),
                    orderAmount, BigDecimal.ZERO, orderAmount, "Mã giảm giá đã hết hạn sử dụng.");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(),
                    orderAmount, BigDecimal.ZERO, orderAmount, "Mã giảm giá đã vượt quá số lần sử dụng cho phép.");
        }

        if (coupon.getMinOrderValue() != null && orderAmount.compareTo(coupon.getMinOrderValue()) < 0) {
            return new CouponValidationResponse(false, normalizedCode, coupon.getDiscountType(), coupon.getDiscountValue(),
                    orderAmount, BigDecimal.ZERO, orderAmount,
                    "Đơn hàng chưa đạt giá trị tối thiểu " + coupon.getMinOrderValue() + "đ để áp dụng mã này.");
        }

        BigDecimal val = coupon.getDiscountValue() != null ? coupon.getDiscountValue() : BigDecimal.ZERO;
        BigDecimal discount = val.min(orderAmount);
        BigDecimal finalAmount = orderAmount.subtract(discount);

        return new CouponValidationResponse(true, normalizedCode, "FIXED", val,
                orderAmount, discount, finalAmount, "Áp dụng mã giảm giá thành công!");
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coupon code cannot be empty");
        }
        if (couponRepository.existsByCode(request.getCode().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + request.getCode());
        }

        Coupon coupon = couponMapper.toEntity(request);
        coupon.setCode(request.getCode().trim().toUpperCase());
        coupon.setDiscountType("FIXED");
        validateCouponValues(coupon.getDiscountValue(), coupon.getMinOrderValue());
        if (coupon.getUsedCount() == null) {
            coupon.setUsedCount(0);
        }
        if (coupon.getActive() == null) {
            coupon.setActive(true);
        }

        Coupon savedCoupon = couponRepository.save(coupon);
        return couponMapper.toResponse(savedCoupon);
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon existingCoupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found with id: " + id));

        if (request.getCode() != null && !request.getCode().trim().equalsIgnoreCase(existingCoupon.getCode())) {
            if (couponRepository.existsByCodeAndIdNot(request.getCode().trim(), id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Coupon code already exists: " + request.getCode());
            }
        }

        couponMapper.updateCoupon(request, existingCoupon);
        existingCoupon.setDiscountType("FIXED");
        if (request.getCode() != null) {
            existingCoupon.setCode(request.getCode().trim().toUpperCase());
        }
        validateCouponValues(existingCoupon.getDiscountValue(), existingCoupon.getMinOrderValue());

        Coupon updatedCoupon = couponRepository.save(existingCoupon);
        return couponMapper.toResponse(updatedCoupon);
    }

    private void validateCouponValues(BigDecimal discountValue, BigDecimal minOrderValue) {
        if (discountValue != null && discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị giảm giá phải lớn hơn 0");
        }
        if (discountValue != null) {
            BigDecimal minOrder = minOrderValue != null ? minOrderValue : BigDecimal.ZERO;
            if (discountValue.compareTo(minOrder) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Giá trị giảm giá không được lớn hơn giá trị đơn hàng tối thiểu");
            }
        }
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Coupon not found with id: " + id);
        }
        couponRepository.deleteById(id);
    }
}
