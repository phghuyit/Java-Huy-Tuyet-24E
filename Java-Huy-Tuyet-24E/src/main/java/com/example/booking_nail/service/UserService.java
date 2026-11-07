package com.example.booking_nail.service;

import com.example.booking_nail.dto.request.UserCreationRequest;
import com.example.booking_nail.dto.request.UserUpdateRequest;
import com.example.booking_nail.entity.Role;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final RoleService roleService;
    private final PasswordEncoder passwordEncoder;
    private final AvatarService avatarService;

    @Transactional
    public User createUser(UserCreationRequest request) {
        return createUser(request, null);
    }

    @Transactional
    public User createUser(UserCreationRequest request, MultipartFile avatarFile) {
        validateFields(request.getFullName(), request.getEmail(), request.getPhone());
        String email = request.getEmail().strip().toLowerCase(Locale.ROOT);
        String phone = normalizePhone(request.getPhone());
        String password = validatePassword(request.getPassword());
        String avatar = validateAvatar(request.getAvatarUrl());
        String status = validateStatus(request.getStatus(), "ACTIVE");

        if (userRepository.existsByEmail(email)) {
            throw conflict("Email đã được sử dụng");
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw conflict("Số điện thoại đã được sử dụng");
        }

        Role role = request.getRoleId() == null ? roleService.getDefaultRole() : roleService.getRole(request.getRoleId());

        User user = new User();
        user.setFullName(request.getFullName().strip());
        user.setEmail(email);
        user.setPhone(phone);
        user.setStatus(status);
        user.setRole(role);
        user.setAvatarUrl(avatarFile == null ? avatar : avatarService.store(avatarFile));
        user.setJobTitle(request.getJobTitle() != null ? request.getJobTitle().strip() : null);
        user.setBio(request.getBio() != null ? request.getBio().strip() : null);
        user.setExperienceYears(request.getExperienceYears());
        if (password != null) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(user.getCreatedAt());
        return userRepository.save(user);
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(String roleCode) {
        if (roleCode == null || roleCode.isBlank()) {
            return userRepository.findAll();
        }
        return userRepository.findByRoleCode(roleCode.toUpperCase(Locale.ROOT));
    }

    public User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
    }

    @Transactional
    public User updateUser(Long id, UserUpdateRequest request) {
        return updateUser(id, request, null);
    }

    @Transactional
    public User updateUser(Long id, UserUpdateRequest request, MultipartFile avatarFile) {
        User user = getUser(id);
        validateFields(request.getFullName(), request.getEmail(), request.getPhone());

        String email = request.getEmail().strip().toLowerCase(Locale.ROOT);
        String phone = normalizePhone(request.getPhone());
        String password = validatePassword(request.getPassword());
        String status = validateStatus(request.getStatus(), user.getStatus());
        String avatar = request.getAvatarUrl() == null ? user.getAvatarUrl() : validateAvatar(request.getAvatarUrl());
        Role role = request.getRoleId() == null ? user.getRole() : roleService.getRole(request.getRoleId());

        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw conflict("Email đã được sử dụng");
        }
        if (phone != null && userRepository.existsByPhoneAndIdNot(phone, id)) {
            throw conflict("Số điện thoại đã được sử dụng");
        }

        if (isActiveAdmin(user) && (role == null || !"ADMIN".equals(role.getCode()) || !"ACTIVE".equals(status))) {
            long activeAdminCount = userRepository.countActiveAdmins();
            if (activeAdminCount <= 1) {
                throw conflict("Không thể khóa hoặc hạ quyền tài khoản ADMIN cuối cùng");
            }
        }
        String oldAvatar = user.getAvatarUrl();
        if (avatarFile != null) {
            avatar = avatarService.store(avatarFile);
        }

        user.setFullName(request.getFullName().strip());
        user.setEmail(email);
        user.setPhone(phone);
        user.setRole(role);
        user.setStatus(status);
        user.setAvatarUrl(avatar);
        if (request.getJobTitle() != null) {
            user.setJobTitle(request.getJobTitle().strip());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().strip());
        }
        if (request.getExperienceYears() != null) {
            user.setExperienceYears(request.getExperienceYears());
        }
        if (password != null) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        if (!Objects.equals(oldAvatar, avatar)) {
            avatarService.deleteAfterCommit(oldAvatar);
        }
        return saved;
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUser(id);

        if (isActiveAdmin(user)) {
            long activeAdminCount = userRepository.countActiveAdmins();
            if (activeAdminCount <= 1) {
                throw conflict("Không thể xóa tài khoản ADMIN cuối cùng");
            }
        }

        userRepository.delete(user);
        avatarService.deleteAfterCommit(user.getAvatarUrl());
    }

    private boolean isActiveAdmin(User user) {
        return user.getRole() != null && "ADMIN".equals(user.getRole().getCode())
                && "ACTIVE".equals(user.getStatus());
    }

    private void validateFields(String fullName, String email, String phone) {
        if (fullName == null || fullName.strip().isBlank() || fullName.strip().length() > 150) {
            throw badRequest("Họ tên phải có từ 1 đến 150 ký tự");
        }
        if (email == null || email.length() > 255 || !email.strip().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw badRequest("Email không hợp lệ");
        }
        if (phone != null && !phone.isBlank() && !phone.strip().matches("^(0\\d{9}|\\+84\\d{9})$")) {
            throw badRequest("Số điện thoại không hợp lệ");
        }
    }

    private String normalizePhone(String phone) {
        return phone == null || phone.isBlank() ? null : phone.strip();
    }

    private String validatePassword(String password) {
        if (password == null || password.isEmpty()) return null;
        if (password.isBlank() || password.length() < 8 || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw badRequest("Mật khẩu phải từ 8 ký tự và không quá 72 byte UTF-8");
        }
        return password;
    }

    private String validateStatus(String status, String fallback) {
        if (status == null) return fallback;
        String value = status.strip().toUpperCase(Locale.ROOT);
        if (!List.of("ACTIVE", "LOCKED").contains(value)) {
            throw badRequest("Trạng thái phải là ACTIVE hoặc LOCKED");
        }
        return value;
    }

    private String validateAvatar(String avatar) {
        if (avatar == null || avatar.isBlank()) return null;
        String value = avatar.strip();
        if (AvatarService.isManagedUrl(value)) return value;
        try {
            URI uri = URI.create(value);
            if (value.length() > 255 || uri.getScheme() == null || !List.of("http", "https").contains(uri.getScheme().toLowerCase(Locale.ROOT))
                    || uri.getHost() == null || uri.getUserInfo() != null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException exception) {
            throw badRequest("Ảnh đại diện cần URL http/https hợp lệ, tối đa 255 ký tự");
        }
        return value;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
