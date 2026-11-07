package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Product;
import com.example.booking_nail.entity.Stock;
import com.example.booking_nail.repository.ProductRepository;
import com.example.booking_nail.repository.StockRepository;
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
public class StockDataInitializer implements CommandLineRunner {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (stockRepository.count() > 0) return;

        var products = productRepository.findAll();
        if (products.isEmpty()) return;

        Product p1 = products.get(0);
        Stock s1 = new Stock(
                null,
                p1.getId(),
                p1.getName(),
                p1.getSku(),
                "IMPORT",
                15,
                30,
                45,
                "Nhập hàng định kỳ từ nhà phân phối",
                "Quản trị viên VELA",
                LocalDateTime.now().minusDays(2)
        );
        stockRepository.save(s1);

        if (products.size() > 1) {
            Product p2 = products.get(1);
            Stock s2 = new Stock(
                    null,
                    p2.getId(),
                    p2.getName(),
                    p2.getSku(),
                    "EXPORT",
                    -2,
                    10,
                    8,
                    "Xuất dùng cho bàn làm việc tầng 1",
                    "Lễ tân VELA",
                    LocalDateTime.now().minusHours(12)
            );
            stockRepository.save(s2);
        }
    }
}
