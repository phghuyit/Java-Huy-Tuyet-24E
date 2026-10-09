package com.example.booking_nail.config;

import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.entity.Category;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class NailServiceDataInitializer implements CommandLineRunner {
    private final NailServiceRepository nailServiceRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        // Resolve generated IDs instead of assuming categories have fixed IDs.
        Category nailCategory = createCategoryIfMissing("Làm nail", "Dịch vụ làm đẹp và chăm sóc móng.");
        createCategoryIfMissing("Wax lông", "Dịch vụ wax và tẩy lông.");
        createCategoryIfMissing("Làm tóc", "Dịch vụ cắt, tạo kiểu và chăm sóc tóc.");

        if (nailServiceRepository.count() > 0) {
            return;
        }

        nailServiceRepository.saveAll(List.of(
                new NailService(null, nailCategory.getId(), "Sơn gel", 150000.0, 45,
                        "Sơn gel với màu sắc theo lựa chọn của khách hàng.", null, "ACTIVE"),
                new NailService(null, nailCategory.getId(), "Sơn thường", 80000.0, 30,
                        "Làm sạch và sơn móng tay bằng sơn thường.", null, "ACTIVE"),
                new NailService(null, nailCategory.getId(), "Đắp móng gel", 300000.0, 90,
                        "Nối dài và tạo hình móng bằng gel.", null, "ACTIVE"),
                new NailService(null, nailCategory.getId(), "Chăm sóc móng tay", 100000.0, 30,
                        "Cắt, giũa móng và chăm sóc vùng da quanh móng tay.", null, "ACTIVE"),
                new NailService(null, nailCategory.getId(), "Chăm sóc móng chân", 120000.0, 40,
                        "Vệ sinh, cắt và chăm sóc móng chân.", null, "ACTIVE")
        ));
    }

    private Category createCategoryIfMissing(String name, String description) {
        return categoryRepository.findByName(name).orElseGet(() ->
                categoryRepository.save(new Category(null, name, description, "ACTIVE")));
    }
}
