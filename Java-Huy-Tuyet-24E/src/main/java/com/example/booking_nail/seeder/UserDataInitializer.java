package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Role;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@Order(2)
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-data.enabled", havingValue = "true")
public class UserDataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        Role adminRole = roleRepository.findByCode("ADMIN").orElse(null);
        Role receptionistRole = roleRepository.findByCode("RECEPTIONIST").orElse(null);
        Role staffRole = roleRepository.findByCode("STAFF").orElse(null);
        Role customerRole = roleRepository.findByCode("CUSTOMER").orElse(null);

        upsertUser("Quản trị VELA", "admin@vela.com", "0901234560", "Password123!", adminRole);
        upsertUser("Quản trị VELA", "admin@gmail.com", "0901234567", "Password123!", adminRole);
        upsertUser("Lễ tân VELA", "letan@vela.com", "0901234561", "Password123!", receptionistRole);
        upsertUser("Lễ tân VELA", "letan@gmail.com", "0901234568", "Password123!", receptionistRole);
        upsertUser("Nhân viên VELA", "staff@gmail.com", "0901234569", null, staffRole);
        upsertUser("Nguyễn Quỳnh Anh", "quynhanh.staff@gmail.com", "0902000001", null, staffRole);
        upsertUser("Lê Hoàng Yến", "hoangyen.staff@gmail.com", "0902000002", null, staffRole);
        upsertUser("Phạm Thu Hương", "thuhuong.staff@gmail.com", "0902000003", null, staffRole);
        upsertUser("Vũ Minh Phương", "minhphuong.staff@gmail.com", "0902000004", null, staffRole);
        upsertUser("Đỗ Cẩm Ly", "camly.staff@gmail.com", "0902000005", null, staffRole);

        upsertUser("Phạm Thu Hà", "thuha@example.com", "0910000004", "Password123!", customerRole);
        upsertUser("Nguyễn Minh Anh", "minhanh@example.com", "0910000001", "Password123!", customerRole);
        upsertUser("Trần Thảo Linh", "thaolinh@example.com", "0910000002", "Password123!", customerRole);
        upsertUser("Lê Ngọc Mai", "ngocmai@example.com", "0910000003", "Password123!", customerRole);
        upsertUser("Hoàng Bảo Ngọc", "baongoc@example.com", "0910000005", "Password123!", customerRole);
    }

    private void upsertUser(String fullName, String email, String phone, String password, Role role) {
        var existing = userRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            User user = existing.get();
            boolean changed = false;
            if (role != null && "STAFF".equals(role.getCode()) && user.getPasswordHash() != null) {
                user.setPasswordHash(null);
                changed = true;
            } else if (password != null && (user.getPasswordHash() == null || user.getPasswordHash().isBlank())) {
                user.setPasswordHash(passwordEncoder.encode(password));
                changed = true;
            }
            if (user.getRole() == null && role != null) {
                user.setRole(role);
                changed = true;
            }
            if (user.getStatus() == null) {
                user.setStatus("ACTIVE");
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
            }
            return;
        }

        if (phone != null && userRepository.existsByPhone(phone)) {
            return;
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setStatus("ACTIVE");
        user.setRole(role);
        user.setPasswordHash(password != null ? passwordEncoder.encode(password) : null);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
