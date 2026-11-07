package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Category;
import com.example.booking_nail.entity.NailService;
import com.example.booking_nail.repository.CategoryRepository;
import com.example.booking_nail.repository.NailServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(3)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class NailServiceDataInitializer implements CommandLineRunner {
    private final NailServiceRepository nailServiceRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Category nailCategory = createCategoryIfMissing("Làm nail", "Dịch vụ làm đẹp và chăm sóc móng.");
        Category hairCategory = createCategoryIfMissing("Làm tóc", "Dịch vụ cắt, tạo kiểu và chăm sóc tóc.");
        Category lashCategory = createCategoryIfMissing("Nối mi & Chân mày", "Thiết kế dáng mi phù hợp với đôi mắt, nhẹ nhàng và tự nhiên.");
        Category skincareCategory = createCategoryIfMissing("Chăm sóc da", "Liệu trình chăm sóc và nuôi dưỡng làn da chuyên sâu.");
        Category spaCategory = createCategoryIfMissing("Gội đầu & Spa", "Không gian thư giãn với các liệu trình gội đầu và chăm sóc da đầu.");
        Category waxCategory = createCategoryIfMissing("Wax lông", "Dịch vụ wax và tẩy lông nhẹ nhàng, vệ sinh an toàn.");

        createServiceIfMissing(nailCategory.getId(), "Sơn gel", 150000.0, 45,
                "Sơn gel với màu sắc theo lựa chọn của khách hàng.",
                "/images/photo-1632345031435-8727f6897d53.jpg");
        createServiceIfMissing(nailCategory.getId(), "Sơn thường", 80000.0, 30,
                "Làm sạch và sơn móng tay bằng sơn thường.",
                "/images/photo-1610992015762-45dca7fa3a85.jpg");
        createServiceIfMissing(nailCategory.getId(), "Đắp móng gel", 300000.0, 90,
                "Nối dài và tạo hình móng bằng gel cao cấp.",
                "/images/photo-1690749138086-7422f71dc159.jpg");
        createServiceIfMissing(nailCategory.getId(), "Chăm sóc móng tay", 100000.0, 30,
                "Cắt, giũa móng và chăm sóc vùng da quanh móng tay.",
                "/images/photo-1519014816548-bf5fe059798b.jpg");
        createServiceIfMissing(nailCategory.getId(), "Chăm sóc móng chân", 120000.0, 40,
                "Vệ sinh, cắt và chăm sóc móng chân chuyên sâu.",
                "/images/photo-1604902396830-aca29e19b067.jpg");
        createServiceIfMissing(nailCategory.getId(), "Vẽ móng nghệ thuật", 180000.0, 45,
                "Vẽ họa tiết thủ công và chi tiết theo phong cách riêng.",
                "/images/photo-1587729927069-ef3b7a5ab9b4.jpg");

        createServiceIfMissing(hairCategory.getId(), "Cắt tóc thiết kế", 350000.0, 60,
                "Đường cắt được tạo theo gương mặt và nếp tóc của bạn.",
                "/images/photo-1779153862705-5969578ac606.jpg");
        createServiceIfMissing(hairCategory.getId(), "Nhuộm Balayage VELA", 1800000.0, 90,
                "Sắc màu chuyển nhẹ, hài hòa với nền tóc tự nhiên.",
                "/images/photo-1619520167112-c8cb9961e30a.jpg");
        createServiceIfMissing(hairCategory.getId(), "Phục hồi tóc bóng mượt", 600000.0, 45,
                "Chăm sóc biểu bì tóc để có độ bóng và mềm mại.",
                "/images/photo-1521590832167-7bcbfaa6381f.jpg");
        createServiceIfMissing(hairCategory.getId(), "Nhuộm tóc sáng VELA", 2500000.0, 180,
                "Nâng tông và điều chỉnh sắc độ với chăm sóc phục hồi.",
                "/images/photo-1779399147716-a3ca1e519406.jpg");
        createServiceIfMissing(hairCategory.getId(), "Nhuộm chân tóc", 900000.0, 75,
                "Làm đều phần chân tóc với màu tóc hiện tại.",
                "/images/photo-1560869713-7d0a29430803.jpg");
        createServiceIfMissing(hairCategory.getId(), "Sấy tạo kiểu", 350000.0, 45,
                "Mái tóc có độ phồng tự nhiên và chuyển động mềm mại.",
                "/images/photo-1580618672591-eb180b1a973f.jpg");
        createServiceIfMissing(hairCategory.getId(), "Làm mượt tóc Keratin", 2200000.0, 150,
                "Giảm xơ rối, giữ độ mềm mại tự nhiên cho tóc.",
                "/images/photo-1600948836101-f9ffda59d250.jpg");

        createServiceIfMissing(lashCategory.getId(), "Nối mi tự nhiên Classic", 350000.0, 60,
                "Từng sợi mi nhẹ nhàng, tôn nét thanh thoát tự nhiên.",
                "/images/photo-1589710751893-f9a6770ad71b.jpg");
        createServiceIfMissing(lashCategory.getId(), "Nối mi Volume dày", 550000.0, 90,
                "Dáng mi được thiết kế tạo độ dày và cuốn hút.",
                "/images/photo-1735151226446-1d364b4adc2f.jpg");
        createServiceIfMissing(lashCategory.getId(), "Uốn và nhuộm mi Collagen", 300000.0, 45,
                "Làm cong mi tự nhiên và dưỡng collagen bóng mượt.",
                "/images/photo-1639629509821-c54cdd984227.jpg");
        createServiceIfMissing(lashCategory.getId(), "Định hình và nhuộm chân mày", 250000.0, 30,
                "Tạo dáng chân mày cân đối hài hòa với gương mặt.",
                "/images/photo-1548902378-2ec44c906391.jpg");

        createServiceIfMissing(skincareCategory.getId(), "Chăm sóc da chuyên sâu VELA", 650000.0, 60,
                "Hiểu làn da trước khi chọn từng bước làm sạch và cấp ẩm.",
                "/images/photo-1616394584738-fc6e612e71b9.jpg");
        createServiceIfMissing(skincareCategory.getId(), "Làm sáng da nhẹ nhàng Glow Peel", 750000.0, 45,
                "Chăm sóc bề mặt da và tẩy tế bào chết sinh học dịu nhẹ.",
                "/images/photo-1570172619644-dfd03ed5d881.jpg");
        createServiceIfMissing(skincareCategory.getId(), "Dưỡng sáng da Vitamin C", 850000.0, 75,
                "Bổ sung dưỡng chất và điện di tinh chất giúp làn da tươi sáng.",
                "/images/photo-1598440947619-2c35fc9aa908.jpg");
        createServiceIfMissing(skincareCategory.getId(), "Cấp ẩm chuyên sâu phục hồi da", 500000.0, 45,
                "Mặt nạ sinh học và dưỡng chất làm dịu hàng rào bảo vệ da.",
                "/images/photo-1693004927824-f2623bbedc8b.jpg");

        createServiceIfMissing(spaCategory.getId(), "Gội đầu dưỡng sinh thư giãn", 250000.0, 60,
                "Gội thảo mộc kết hợp massage bấm huyệt cổ vai gáy.",
                "/images/photo-1761470575018-135c213340eb.jpg");
        createServiceIfMissing(spaCategory.getId(), "Gội đầu thư giãn Nhật Bản Head Spa", 750000.0, 90,
                "90 phút chăm sóc da đầu chuyên sâu trong không gian yên tĩnh.",
                "/images/photo-1693578538512-fc66f318c833.jpg");
        createServiceIfMissing(spaCategory.getId(), "Làm sạch da đầu Scalp Detox", 450000.0, 45,
                "Làm sạch cặn sản phẩm và cân bằng độ ẩm da đầu.",
                "/images/photo-1611920629515-3f76f8c36b37.jpg");
        createServiceIfMissing(spaCategory.getId(), "Liệu trình thư giãn toàn diện VELA", 1800000.0, 150,
                "Chăm sóc da đầu, massage trị liệu và dưỡng ẩm thư thái trọn vẹn.",
                "/images/photo-1776763019060-fa0663574ae6.jpg");

        createServiceIfMissing(waxCategory.getId(), "Wax tạo hình chân mày", 120000.0, 20,
                "Định hình đường chân mày gọn gàng, sắc nét.",
                "/images/photo-1548902378-2ec44c906391.jpg");
        createServiceIfMissing(waxCategory.getId(), "Wax ria mép nhẹ dịu", 80000.0, 15,
                "Tẩy sạch lông vùng mép với sáp dưỡng da dịu nhẹ.",
                "/images/photo-1524504388940-b1c1722653e1.jpg");
        createServiceIfMissing(waxCategory.getId(), "Wax tay trọn gói", 220000.0, 30,
                "Làm sạch lông cánh tay và thoa dưỡng ức chế mọc lông.",
                "/images/photo-1519014816548-bf5fe059798b.jpg");
        createServiceIfMissing(waxCategory.getId(), "Wax chân toàn phần", 320000.0, 45,
                "Liệu trình wax chân nhẹ nhàng, không gây kích ứng.",
                "/images/photo-1604902396830-aca29e19b067.jpg");
    }

    private Category createCategoryIfMissing(String name, String description) {
        return categoryRepository.findByName(name).orElseGet(() ->
                categoryRepository.save(new Category(null, name, description, "ACTIVE")));
    }

    private void createServiceIfMissing(Long categoryId, String name, Double price, Integer durationMinutes, String description, String imageUrl) {
        var existing = nailServiceRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            NailService s = existing.get();
            if (s.getImageUrl() == null || s.getImageUrl().contains("placeholder")) {
                s.setImageUrl(imageUrl);
                nailServiceRepository.save(s);
            }
        } else {
            nailServiceRepository.save(new NailService(null, categoryId, name, price, durationMinutes, description, imageUrl, "ACTIVE"));
        }
    }
}
