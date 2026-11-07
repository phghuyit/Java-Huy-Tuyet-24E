package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Category;
import com.example.booking_nail.entity.Product;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@Order(4)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class ProductDataInitializer implements CommandLineRunner {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() > 0) {
            return;
        }

        Category productCategory = categoryRepository.findByName("Sản phẩm móng")
                .orElseGet(() -> categoryRepository.save(
                        new Category(null, "Sản phẩm móng", "PRODUCT", "Các sản phẩm chăm sóc và làm đẹp móng.", "ACTIVE")));

        productRepository.saveAll(List.of(
                new Product(null, productCategory.getId(), "PROD-OPI-01", "Sơn gel OPI Classic Red", "Chai",
                        BigDecimal.valueOf(120000), BigDecimal.valueOf(180000), 50, 10, true, "ACTIVE", null),
                new Product(null, productCategory.getId(), "PROD-OIL-02", "Dầu dưỡng viền móng Cuticle Oil", "Lọ",
                        BigDecimal.valueOf(60000), BigDecimal.valueOf(95000), 30, 5, true, "ACTIVE", null),
                new Product(null, productCategory.getId(), "PROD-HAND-03", "Kem dưỡng da tay L'Occitane Shea", "Tuýp",
                        BigDecimal.valueOf(150000), BigDecimal.valueOf(220000), 20, 5, true, "ACTIVE", null)
        ));
    }
}
