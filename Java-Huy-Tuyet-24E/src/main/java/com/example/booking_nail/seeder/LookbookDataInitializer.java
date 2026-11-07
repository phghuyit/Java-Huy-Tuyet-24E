package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.LookbookEntry;
import com.example.booking_nail.repository.LookbookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Order(5)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class LookbookDataInitializer implements CommandLineRunner {

    private final LookbookRepository lookbookRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (lookbookRepository.count() > 0) return;

        lookbookRepository.save(new LookbookEntry(
                null,
                "Sơn gel thạch hồng viền ánh kim",
                "nails",
                "/images/photo-1632345031435-8727f6897d53.jpg",
                1L,
                1L,
                "Móng dáng hạnh nhân thanh lịch với lớp viền nhũ vàng 24K sang trọng.",
                LocalDateTime.now().minusDays(3)
        ));

        lookbookRepository.save(new LookbookEntry(
                null,
                "Ombre mắt mèo ánh trăng 9D",
                "nails",
                "/images/photo-1610992015836-7c249d75782d.jpg",
                2L,
                2L,
                "Kỹ thuật tạo vệt sáng galaxy hút mắt, bắt sáng đa góc nhìn.",
                LocalDateTime.now().minusDays(5)
        ));

        lookbookRepository.save(new LookbookEntry(
                null,
                "Nối mi thiết kế Katun tự nhiên",
                "lashes",
                "/images/photo-1583843364289-0d1b2978874c.jpg",
                3L,
                3L,
                "Sợi mi lụa tơ mỏng nhẹ, xen kẽ tạo chiều sâu cho đôi mắt cuốn hút.",
                LocalDateTime.now().minusDays(7)
        ));

        lookbookRepository.save(new LookbookEntry(
                null,
                "Liệu trình Gội đầu dưỡng sinh & Thư giãn",
                "spa",
                "/images/photo-1560066984-138dadb4c035.jpg",
                4L,
                4L,
                "Kết hợp thảo mộc thiên nhiên và massage bấm huyệt cổ vai gáy.",
                LocalDateTime.now().minusDays(10)
        ));

        lookbookRepository.save(new LookbookEntry(
                null,
                "Chăm sóc phục hồi móng yếu & Cắt da chuẩn Nga",
                "nails",
                "/images/photo-1554519934-e32b1629d9ee.jpg",
                1L,
                2L,
                "Phục hồi biểu bì móng hư tổn với tinh chất keratin và dầu dưỡng organic.",
                LocalDateTime.now().minusDays(12)
        ));
    }
}
