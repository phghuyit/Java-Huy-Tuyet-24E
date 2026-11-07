package com.example.booking_nail.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {
    private boolean valid;
    private String couponCode;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String message;
}
