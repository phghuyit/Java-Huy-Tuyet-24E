package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Coupon;
import com.example.booking_nail.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(6)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class CouponDataInitializer implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    @Transactional
    public void run(String... args) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneYearLater = now.plusYears(1);

        upsertCoupon("WELCOME20K", "Giảm 20.000đ cho đơn hàng mới từ 100.000đ", BigDecimal.valueOf(20000), BigDecimal.valueOf(100000), 100, now, oneYearLater);
        upsertCoupon("SUMMER50K", "Khuyến mãi mùa hè giảm 50.000đ cho đơn từ 200.000đ", BigDecimal.valueOf(50000), BigDecimal.valueOf(200000), 50, now, oneYearLater);
        upsertCoupon("GIAM30K", "Giảm 30.000đ cho hoá đơn từ 150.000đ", BigDecimal.valueOf(30000), BigDecimal.valueOf(150000), 200, now, oneYearLater);
    }

    private void upsertCoupon(String code, String name, BigDecimal discountVal, BigDecimal minOrder, int limit, LocalDateTime start, LocalDateTime end) {
        var existing = couponRepository.findByCode(code);
        if (existing.isPresent()) {
            Coupon c = existing.get();
            c.setName(name);
            c.setDiscountType("FIXED");
            c.setDiscountValue(discountVal);
            c.setMinOrderValue(minOrder);
            c.setMaxDiscount(discountVal);
            c.setActive(true);
            couponRepository.save(c);
            return;
        }

        Coupon coupon = new Coupon(
                null,
                code,
                name,
                "FIXED",
                discountVal,
                minOrder,
                discountVal,
                limit,
                0,
                start,
                end,
                true
        );
        couponRepository.save(coupon);
    }
}
