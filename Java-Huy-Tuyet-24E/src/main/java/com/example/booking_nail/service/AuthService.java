package com.example.booking_nail.service;

import com.example.booking_nail.dto.response.AuthResponse;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService implements UserDetailsService {
    public static final int RESET_EXPIRY_MINUTES = 30;

    private final UserRepository userRepository;
    private final Map<String, ResetTicket> resetTickets = new ConcurrentHashMap<>();

    public record ResetTicket(String token, String email, String scope, Instant expiresAt, boolean used) {}

    @Override
    public UserDetails loadUserByUsername(String identifier) {
        String key = identifier.strip();
        var user = (key.contains("@")
                ? userRepository.findByEmailIgnoreCase(key.toLowerCase(Locale.ROOT))
                : userRepository.findByPhone(key))
                .orElseThrow(() -> new UsernameNotFoundException("Thông tin đăng nhập không hợp lệ"));

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank() || user.getRole() == null
                || "STAFF".equalsIgnoreCase(user.getRole().getCode())) {
            throw new UsernameNotFoundException("Thông tin đăng nhập không hợp lệ");
        }

        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().getCode())
                .disabled(!"ACTIVE".equalsIgnoreCase(user.getStatus()))
                .build();
    }

    public AuthResponse currentUser(String email) {
        return AuthResponse.from(currentAccount(email));
    }

    public User currentAccount(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ"));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus()) || user.getRole() == null
                || "STAFF".equalsIgnoreCase(user.getRole().getCode())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản đã bị khóa hoặc không còn quyền truy cập");
        }
        return user;
    }

    @Transactional
    public User completeLogin(String email) {
        return currentAccount(email);
    }

    public String issuePasswordResetToken(String rawEmail, String rawScope) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập email hợp lệ");
        }
        String email = rawEmail.strip().toLowerCase(Locale.ROOT);
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email không hợp lệ");
        }
        String scope = (rawScope != null && "admin".equalsIgnoreCase(rawScope.strip())) ? "admin" : "customer";

        resetTickets.entrySet().removeIf(e ->
                (e.getValue().email().equalsIgnoreCase(email) && e.getValue().scope().equalsIgnoreCase(scope))
                        || e.getValue().expiresAt().isBefore(Instant.now().minus(RESET_EXPIRY_MINUTES, ChronoUnit.MINUTES)));

        var found = userRepository.findByEmailIgnoreCase(email);
        if (found.isEmpty()) {
            return null;
        }
        User user = found.get();
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus()) || user.getRole() == null) {
            return null;
        }
        String roleCode = user.getRole().getCode().toUpperCase(Locale.ROOT);
        boolean matchesScope = "admin".equals(scope)
                ? Set.of("ADMIN", "RECEPTIONIST").contains(roleCode)
                : "CUSTOMER".equals(roleCode);
        if (!matchesScope) {
            return null;
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        resetTickets.put(token, new ResetTicket(
                token,
                email,
                scope,
                Instant.now().plus(RESET_EXPIRY_MINUTES, ChronoUnit.MINUTES),
                false
        ));
        return token;
    }

    public Map<String, Object> verifyResetToken(String token, String scope) {
        if (token == null || token.isBlank()) {
            return Map.of("valid", false, "reason", "missing", "message", "Liên kết đặt lại mật khẩu không hợp lệ.");
        }
        ResetTicket ticket = resetTickets.get(token.strip());
        if (ticket == null || (scope != null && !scope.isBlank() && !ticket.scope().equalsIgnoreCase(scope.strip()))) {
            return Map.of("valid", false, "reason", "missing", "message", "Liên kết đặt lại mật khẩu không hợp lệ.");
        }
        if (ticket.used()) {
            return Map.of("valid", false, "reason", "used", "message", "Liên kết này đã được sử dụng. Vui lòng yêu cầu liên kết mới.");
        }
        if (ticket.expiresAt().isBefore(Instant.now())) {
            return Map.of("valid", false, "reason", "expired", "message", "Liên kết đã hết hạn sau 30 phút. Vui lòng yêu cầu lại.");
        }
        return Map.of("valid", true, "email", ticket.email(), "scope", ticket.scope());
    }

    @Transactional
    public void resetPassword(String token, String rawEmail, String newPassword, PasswordEncoder passwordEncoder) {
        validateNewPassword(newPassword);

        String targetEmail;
        if (token != null && !token.isBlank()) {
            ResetTicket ticket = resetTickets.get(token.strip());
            if (ticket == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
            }
            if (ticket.used()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Liên kết đặt lại mật khẩu này đã được sử dụng");
            }
            if (ticket.expiresAt().isBefore(Instant.now())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Liên kết đặt lại mật khẩu đã hết hạn");
            }
            targetEmail = ticket.email();
            resetTickets.put(ticket.token(), new ResetTicket(
                    ticket.token(), ticket.email(), ticket.scope(), ticket.expiresAt(), true
            ));
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu mã xác thực đặt lại mật khẩu");
        }

        User user = userRepository.findByEmailIgnoreCase(targetEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản người dùng"));
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản hiện đang bị khóa");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public static void validateNewPassword(String password) {
        if (password == null || password.isBlank()
                || password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Mật khẩu phải từ 8 ký tự và không quá 72 byte UTF-8");
        }
    }
}
