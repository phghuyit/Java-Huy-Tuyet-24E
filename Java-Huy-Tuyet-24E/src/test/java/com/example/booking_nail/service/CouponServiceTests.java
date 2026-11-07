package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.CouponRequest;
import com.example.booking_nail.dto.request.CouponValidationRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.example.booking_nail.dto.response.CouponValidationResponse;
import com.example.booking_nail.entity.Coupon;
import com.example.booking_nail.mapper.CouponMapper;
import com.example.booking_nail.repository.CouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CouponServiceTests {

    private CouponRepository couponRepository;
    private CouponMapper couponMapper;
    private CouponService couponService;

    @BeforeEach
    void setUp() {
        couponRepository = mock(CouponRepository.class);
        couponMapper = mock(CouponMapper.class);
        couponService = new CouponService(couponRepository, couponMapper);
    }

    @Test
    void validateCoupon_FixedDiscount_Success() {
        Coupon coupon = new Coupon(
                1L, "SUMMER50K", "Summer Discount 50K", "FIXED",
                BigDecimal.valueOf(50000), BigDecimal.valueOf(100000), BigDecimal.valueOf(50000),
                100, 5, LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10), true
        );

        when(couponRepository.findByCode("SUMMER50K")).thenReturn(Optional.of(coupon));

        CouponValidationResponse response = couponService.validateCoupon(
                new CouponValidationRequest("SUMMER50K", BigDecimal.valueOf(200000))
        );

        assertTrue(response.isValid());
        assertEquals(BigDecimal.valueOf(50000), response.getDiscountAmount());
        assertEquals(BigDecimal.valueOf(150000), response.getFinalAmount());
    }

    @Test
    void validateCoupon_DiscountCappedAtOrderAmount() {
        Coupon coupon = new Coupon(
                1L, "GIAM50K", "Discount 50K", "FIXED",
                BigDecimal.valueOf(50000), BigDecimal.ZERO, BigDecimal.valueOf(50000),
                100, 5, LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10), true
        );

        when(couponRepository.findByCode("GIAM50K")).thenReturn(Optional.of(coupon));

        CouponValidationResponse response = couponService.validateCoupon(
                new CouponValidationRequest("GIAM50K", BigDecimal.valueOf(30000))
        );

        assertTrue(response.isValid());
        assertEquals(BigDecimal.valueOf(30000), response.getDiscountAmount());
        assertEquals(BigDecimal.ZERO, response.getFinalAmount());
    }

    @Test
    void validateCoupon_BelowMinOrderValue_Fails() {
        Coupon coupon = new Coupon(
                1L, "SUMMER50K", "Summer Discount", "FIXED",
                BigDecimal.valueOf(50000), BigDecimal.valueOf(200000), null,
                100, 5, LocalDateTime.now().minusDays(1), LocalDateTime.now().plusDays(10), true
        );

        when(couponRepository.findByCode("SUMMER50K")).thenReturn(Optional.of(coupon));

        CouponValidationResponse response = couponService.validateCoupon(
                new CouponValidationRequest("SUMMER50K", BigDecimal.valueOf(150000))
        );

        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("chưa đạt giá trị tối thiểu"));
    }

    @Test
    void validateCoupon_ExpiredCoupon_Fails() {
        Coupon coupon = new Coupon(
                1L, "EXPIRED10", "Expired", "FIXED",
                BigDecimal.valueOf(10000), BigDecimal.ZERO, null,
                100, 0, LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(1), true
        );

        when(couponRepository.findByCode("EXPIRED10")).thenReturn(Optional.of(coupon));

        CouponValidationResponse response = couponService.validateCoupon(
                new CouponValidationRequest("EXPIRED10", BigDecimal.valueOf(100000))
        );

        assertFalse(response.isValid());
        assertTrue(response.getMessage().contains("hết hạn"));
    }

    @Test
    void createCoupon_DiscountGreaterThanMinOrder_ThrowsBadRequest() {
        CouponRequest request = new CouponRequest();
        request.setCode("INVALID50");
        request.setDiscountValue(BigDecimal.valueOf(50000));
        request.setMinOrderValue(BigDecimal.valueOf(30000));

        Coupon mappedEntity = new Coupon();
        mappedEntity.setCode("INVALID50");
        mappedEntity.setDiscountValue(BigDecimal.valueOf(50000));
        mappedEntity.setMinOrderValue(BigDecimal.valueOf(30000));

        when(couponRepository.existsByCode("INVALID50")).thenReturn(false);
        when(couponMapper.toEntity(request)).thenReturn(mappedEntity);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                couponService.createCoupon(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("không được lớn hơn giá trị đơn hàng tối thiểu"));
    }

    @Test
    void updateCoupon_DiscountGreaterThanMinOrder_ThrowsBadRequest() {
        Coupon existing = new Coupon();
        existing.setId(5L);
        existing.setCode("PROMO10");
        existing.setDiscountValue(BigDecimal.valueOf(10000));
        existing.setMinOrderValue(BigDecimal.valueOf(20000));

        CouponRequest updateReq = new CouponRequest();
        updateReq.setCode("PROMO10");
        updateReq.setDiscountValue(BigDecimal.valueOf(80000));
        updateReq.setMinOrderValue(BigDecimal.valueOf(50000));

        when(couponRepository.findById(5L)).thenReturn(Optional.of(existing));
        doAnswer(invocation -> {
            existing.setDiscountValue(BigDecimal.valueOf(80000));
            existing.setMinOrderValue(BigDecimal.valueOf(50000));
            return null;
        }).when(couponMapper).updateCoupon(updateReq, existing);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                couponService.updateCoupon(5L, updateReq)
        );

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertTrue(ex.getReason().contains("không được lớn hơn giá trị đơn hàng tối thiểu"));
    }
}
