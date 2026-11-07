package com.example.booking_nail.mapper;

import com.example.booking_nail.dto.request.CouponRequest;
import com.example.booking_nail.dto.response.CouponResponse;
import com.example.booking_nail.entity.Coupon;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CouponMapper {

    @Mapping(target = "id", ignore = true)
    Coupon toEntity(CouponRequest request);

    CouponResponse toResponse(Coupon coupon);

    @Mapping(target = "id", ignore = true)
    void updateCoupon(CouponRequest request, @MappingTarget Coupon coupon);
}
