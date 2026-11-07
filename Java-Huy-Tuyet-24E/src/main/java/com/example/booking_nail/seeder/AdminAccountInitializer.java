package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Locale;

@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.bootstrap-admin.enabled", havingValue = "true")
public class AdminAccountInitializer implements CommandLineRunner {
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email:}")
    private String email;
    @Value("${app.bootstrap-admin.password:}")
    private String password;
    @Value("${app.bootstrap-admin.phone:}")
    private String phone;
    @Value("${app.bootstrap-admin.name:Quản trị VELA}")
    private String name;

    @Override
    @Transactional
    public void run(String... args) {
        String normalizedEmail = email.strip().toLowerCase(Locale.ROOT);
        var existing = users.findByEmailIgnoreCase(normalizedEmail);
        if (existing.isPresent()) {
            var user = existing.get();
            if (user.getRole() != null && "ADMIN".equals(user.getRole().getCode())
                    && user.getPasswordHash() != null && !user.getPasswordHash().isBlank()) return;
            throw new IllegalStateException("Email khởi tạo đã thuộc hồ sơ có sẵn. Hãy chọn email quản trị mới; không tự thay mật khẩu hoặc role của hồ sơ cũ.");
        }
        if (normalizedEmail.length() > 255 || !normalizedEmail.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
                || !phone.strip().matches("^(0\\d{9}|\\+84\\d{9})$") || name.strip().isBlank() || name.strip().length() > 150
                || password.length() < 8 || password.isBlank() || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException("Cấu hình khởi tạo ADMIN không hợp lệ: cần email, SĐT Việt Nam, họ tên và mật khẩu từ 8 ký tự, tối đa 72 byte UTF-8.");
        }
        if (users.existsByPhone(phone.strip())) {
            throw new IllegalStateException("SĐT khởi tạo ADMIN đã được sử dụng. Hãy chọn SĐT khác.");
        }
        User user = new User();
        user.setFullName(name.strip());
        user.setEmail(normalizedEmail);
        user.setPhone(phone.strip());
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(roles.findByCode("ADMIN").orElseThrow());
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(user.getCreatedAt());
        users.save(user);
    }
}
