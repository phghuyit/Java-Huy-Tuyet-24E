package com.example.booking_nail.seeder;

import com.example.booking_nail.entity.Role;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserDataInitializerTests {
    @Test
    void runningTwiceDoesNotCreateDuplicates() {
        UserRepository repository = mock(UserRepository.class);
        RoleRepository roleRepository = mock(RoleRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(roleRepository.findByCode(anyString())).thenAnswer(call -> {
            String code = call.getArgument(0);
            return Optional.of(new Role(1L, code, code));
        });
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");

        Map<String, User> savedByEmail = new HashMap<>();
        Set<String> phones = new HashSet<>();
        when(repository.findByEmailIgnoreCase(anyString())).thenAnswer(call -> {
            String email = call.getArgument(0);
            return Optional.ofNullable(savedByEmail.get(email.toLowerCase()));
        });
        when(repository.existsByPhone(anyString())).thenAnswer(call -> phones.contains(call.getArgument(0)));
        when(repository.save(any(User.class))).thenAnswer(call -> {
            User user = call.getArgument(0);
            savedByEmail.put(user.getEmail().toLowerCase(), user);
            phones.add(user.getPhone());
            return user;
        });
        UserDataInitializer initializer = new UserDataInitializer(repository, roleRepository, passwordEncoder);
        initializer.run();
        int initialCount = savedByEmail.size();
        initializer.run();
        verify(repository, times(initialCount)).save(any(User.class));
    }

    @Test
    void skipsSeedWhosePhoneAlreadyBelongsToAnotherUser() {
        UserRepository repository = mock(UserRepository.class);
        RoleRepository roleRepository = mock(RoleRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(roleRepository.findByCode(anyString())).thenReturn(Optional.of(new Role(1L, "TEST", "Test")));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(repository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(repository.existsByPhone("0910000001")).thenReturn(true);

        UserDataInitializer initializer = new UserDataInitializer(repository, roleRepository, passwordEncoder);
        initializer.run();
        verify(repository, times(14)).save(any(User.class));
    }
}
