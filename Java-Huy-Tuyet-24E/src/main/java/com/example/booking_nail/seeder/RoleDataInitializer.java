package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Role;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(0)
@RequiredArgsConstructor
public class RoleDataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void run(String... args) {
        createIfMissing("ADMIN", "Quản trị viên");
        createIfMissing("RECEPTIONIST", "Lễ tân");
        createIfMissing("STAFF", "Nhân viên");
        Role customer = createIfMissing("CUSTOMER", "Khách hàng");
        for (var user : userRepository.findByRoleIsNull()) {
            user.setRole(customer);
            userRepository.save(user);
        }
    }

    private Role createIfMissing(String code, String name) {
        return roleRepository.findByCode(code).orElseGet(() -> {
            Role role = new Role();
            role.setCode(code);
            role.setName(name);
            return roleRepository.save(role);
        });
    }
}
