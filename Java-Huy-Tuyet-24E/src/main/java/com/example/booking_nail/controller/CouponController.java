package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.CouponRequest;
import com.example.booking_nail.dto.request.CouponValidationRequest;
import com.example.booking_nail.dto.response.CouponResponse;
import com.example.booking_nail.dto.response.CouponValidationResponse;
import com.example.booking_nail.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public List<CouponResponse> getAllCoupons(@RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        if (activeOnly) {
            return couponService.getActiveCoupons();
        }
        return couponService.getAllCoupons();
    }

    @GetMapping("/{id:[0-9]+}")
    public CouponResponse getCouponById(@PathVariable Long id) {
        return couponService.getCouponById(id);
    }

    @GetMapping("/code/{code}")
    public CouponResponse getCouponByCode(@PathVariable String code) {
        return couponService.getCouponByCode(code);
    }

    @PostMapping("/validate")
    public CouponValidationResponse validateCoupon(@RequestBody CouponValidationRequest request) {
        return couponService.validateCoupon(request);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CouponResponse createCoupon(@RequestBody CouponRequest request) {
        return couponService.createCoupon(request);
    }

    @PutMapping("/{id:[0-9]+}")
    public CouponResponse updateCoupon(@PathVariable Long id, @RequestBody CouponRequest request) {
        return couponService.updateCoupon(id, request);
    }

    @DeleteMapping("/{id:[0-9]+}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
    }
}
