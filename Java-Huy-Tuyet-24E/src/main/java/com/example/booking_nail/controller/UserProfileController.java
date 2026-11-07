package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.AppointmentUpdateRequest;
import com.example.booking_nail.dto.request.UserUpdateRequest;
import com.example.booking_nail.dto.response.AppointmentResponse;
import com.example.booking_nail.dto.response.UserResponse;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.service.AppointmentService;
import com.example.booking_nail.service.AuthService;
import com.example.booking_nail.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserProfileController {
    private final AuthService authService;
    private final UserService userService;
    private final AppointmentService appointmentService;
    private final PasswordEncoder passwordEncoder;

    private User requireCurrentAccount(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập để thực hiện thao tác này");
        }
        return authService.currentAccount(authentication.getName());
    }

    @GetMapping
    public UserResponse getProfile(Authentication authentication) {
        User current = requireCurrentAccount(authentication);
        return UserResponse.from(current);
    }

    @PutMapping
    public UserResponse updateProfile(Authentication authentication,
                                      @RequestBody(required = false) Map<String, String> payload,
                                      HttpServletRequest request) {
        User current = requireCurrentAccount(authentication);
        if (payload == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu cập nhật không hợp lệ");
        }

        String rawName = payload.get("fullName") != null ? payload.get("fullName") : payload.get("name");
        String fullName = (rawName != null && !rawName.isBlank()) ? rawName.strip() : current.getFullName();
        String email = (payload.get("email") != null && !payload.get("email").isBlank())
                ? payload.get("email").strip() : current.getEmail();
        String phone = payload.containsKey("phone") ? payload.get("phone") : current.getPhone();

        UserUpdateRequest updateReq = new UserUpdateRequest();
        updateReq.setFullName(fullName);
        updateReq.setEmail(email);
        updateReq.setPhone(phone);
        updateReq.setStatus(current.getStatus());
        updateReq.setAvatarUrl(current.getAvatarUrl());
        if (current.getRole() != null) {
            updateReq.setRoleId(current.getRole().getId());
        }

        User updated = userService.updateUser(current.getId(), updateReq);

        var newAuth = UsernamePasswordAuthenticationToken.authenticated(
                updated.getEmail(),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + updated.getRole().getCode().toUpperCase()))
        );
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(newAuth);
        SecurityContextHolder.setContext(context);
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.setAttribute("SPRING_SECURITY_CONTEXT", context);
        }

        return UserResponse.from(updated);
    }

    @PutMapping("/password")
    public Map<String, Object> changePassword(Authentication authentication,
                                              @RequestBody(required = false) Map<String, String> payload,
                                              HttpServletRequest request) {
        User current = requireCurrentAccount(authentication);
        if (payload == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu đổi mật khẩu không hợp lệ");
        }
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("password");

        if (current.getPasswordHash() != null && !current.getPasswordHash().isBlank()) {
            if (currentPassword == null || currentPassword.isBlank()
                    || !passwordEncoder.matches(currentPassword, current.getPasswordHash())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không đúng");
            }
        }
        AuthService.validateNewPassword(newPassword);

        UserUpdateRequest updateReq = new UserUpdateRequest();
        updateReq.setFullName(current.getFullName());
        updateReq.setEmail(current.getEmail());
        updateReq.setPhone(current.getPhone());
        updateReq.setStatus(current.getStatus());
        updateReq.setAvatarUrl(current.getAvatarUrl());
        updateReq.setPassword(newPassword);
        if (current.getRole() != null) {
            updateReq.setRoleId(current.getRole().getId());
        }

        User updated = userService.updateUser(current.getId(), updateReq);

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.setAttribute(AuthController.SESSION_PASSWORD_HASH_ATTR, updated.getPasswordHash());
        }

        return Map.of("updated", true, "message", "Đã đổi mật khẩu thành công");
    }

    @GetMapping("/appointments")
    public List<AppointmentResponse> getMyAppointments(Authentication authentication) {
        User current = requireCurrentAccount(authentication);
        return appointmentService.getMyAppointments(current.getId());
    }

    @PutMapping("/appointments/{id:[0-9]+}/reschedule")
    public AppointmentResponse rescheduleMyAppointment(Authentication authentication,
                                                       @PathVariable Long id,
                                                       @RequestBody(required = false) AppointmentUpdateRequest request) {
        User current = requireCurrentAccount(authentication);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn ngày và giờ hẹn mới");
        }
        return appointmentService.rescheduleCustomerAppointment(id, current, request);
    }

    @PostMapping("/appointments/{id:[0-9]+}/cancel")
    public AppointmentResponse cancelMyAppointment(Authentication authentication,
                                                   @PathVariable Long id,
                                                   @RequestBody(required = false) Map<String, String> payload) {
        User current = requireCurrentAccount(authentication);
        String reason = payload != null
                ? (payload.get("reason") != null ? payload.get("reason") : payload.get("cancellationReason"))
                : null;
        return appointmentService.cancelCustomerAppointment(id, current, reason);
    }
}
