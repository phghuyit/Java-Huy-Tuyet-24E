package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.UserCreationRequest;
import com.example.booking_nail.dto.request.UserUpdateRequest;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public User createUser(UserCreationRequest request) {
        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return userRepository.save(user);
    }

    public List<User> getUsers() {
        List<User> users = userRepository.findAll();

        return users;
    }


    public User getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        return user;
    }

    public User updateUser(Long id, UserUpdateRequest request) {
        User user = getUser(id);

        if (request.getEmail() != null
                && userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        }

        if (request.getPhone() != null
                && userRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUser(id);

        userRepository.delete(user);
    }

}
