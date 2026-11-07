package com.example.booking_nail.controller;

import com.example.booking_nail.dto.request.CustomerRegistrationRequest;
import com.example.booking_nail.dto.request.LoginRequest;
import com.example.booking_nail.dto.request.UserCreationRequest;
import com.example.booking_nail.dto.response.AuthResponse;
import com.example.booking_nail.service.AuthService;
import com.example.booking_nail.service.DualSessionService;
import com.example.booking_nail.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    public static final String SESSION_PASSWORD_HASH_ATTR = "SESSION_PASSWORD_HASH";

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final DualSessionService dualSessionService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody(required = false) LoginRequest credentials, HttpServletRequest request,
                              HttpServletResponse response) {
        return signIn(credentials, request, response, false);
    }

    @PostMapping("/client/login")
    public AuthResponse clientLogin(@RequestBody(required = false) LoginRequest credentials, HttpServletRequest request,
                                    HttpServletResponse response) {
        return signIn(credentials, request, response, true);
    }

    @PostMapping("/client/logout")
    public ResponseEntity<Void> clientLogout(HttpServletRequest request, HttpServletResponse response) {
        String customerCookie = getCookieValue(request, DualSessionService.CUSTOMER_COOKIE);
        if (customerCookie != null) {
            dualSessionService.removeSession(customerCookie);
            response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from(DualSessionService.CUSTOMER_COOKIE, "")
                    .path("/").httpOnly(true).sameSite("Lax").maxAge(0).build().toString());
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/client/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody(required = false) CustomerRegistrationRequest registration) {
        if (registration == null || registration.getPassword() == null || registration.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập mật khẩu từ 8 ký tự");
        }
        var creation = new UserCreationRequest();
        creation.setFullName(registration.getFullName());
        creation.setEmail(registration.getEmail());
        creation.setPhone(registration.getPhone());
        creation.setPassword(registration.getPassword());
        return AuthResponse.from(userService.createUser(creation));
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody(required = false) Map<String, String> payload) {
        String email = payload != null ? payload.get("email") : null;
        String scope = payload != null ? payload.getOrDefault("scope", "customer") : "customer";
        String token = authService.issuePasswordResetToken(email, scope);

        Map<String, Object> result = new HashMap<>();
        result.put("sent", true);
        result.put("expiresInMinutes", AuthService.RESET_EXPIRY_MINUTES);
        if (token != null) {
            String base = "admin".equalsIgnoreCase(scope) ? "/admin" : "/account";
            result.put("token", token);
            result.put("resetPath", base + "/reset-password?token=" + token);
        }
        return result;
    }

    @GetMapping("/reset-password/verify")
    public Map<String, Object> verifyResetToken(@RequestParam(required = false) String token,
                                                @RequestParam(required = false) String scope) {
        return authService.verifyResetToken(token, scope);
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody(required = false) Map<String, String> payload,
                                             HttpServletRequest request) {
        if (payload == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu đặt lại mật khẩu không hợp lệ");
        }
        String token = payload.get("token");
        String email = payload.get("email");
        String password = payload.get("password");
        authService.resetPassword(token, email, password, passwordEncoder);

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return Map.of("reset", true, "message", "Đã đặt lại mật khẩu thành công");
    }

    private AuthResponse signIn(LoginRequest credentials, HttpServletRequest request,
                                HttpServletResponse response, boolean customerOnly) {
        if (credentials == null || credentials.getEmail() == null || credentials.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng nhập email hoặc số điện thoại");
        }
        String idKey = credentials.getEmail().strip();
        boolean validEmail = idKey.length() <= 255 && idKey.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
        boolean validPhone = idKey.matches("^(0\\d{9}|\\+84\\d{9})$");
        if (!validEmail && !validPhone) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email hoặc số điện thoại không hợp lệ");
        }

        if (credentials.getPassword() == null || credentials.getPassword().isBlank()
                || credentials.getPassword().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu không hợp lệ");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(
                    idKey.contains("@") ? idKey.toLowerCase(Locale.ROOT) : idKey, credentials.getPassword()));
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }

        var account = authService.completeLogin(authentication.getName());
        AuthResponse user = AuthResponse.from(account);

        boolean allowed = customerOnly
                ? "CUSTOMER".equals(user.roleCode())
                : Set.of("ADMIN", "RECEPTIONIST").contains(user.roleCode());

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, customerOnly
                    ? "Đây là tài khoản nội bộ. Vui lòng đăng nhập tại khu vực quản trị"
                    : "Tài khoản không có quyền truy cập khu vực quản trị");
        }

        HttpSession existingSession = request.getSession(false);
        if (existingSession != null) {
            existingSession.invalidate();
        }
        HttpSession newSession = request.getSession(true);

        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        newSession.setAttribute("SPRING_SECURITY_CONTEXT", context);
        newSession.setAttribute(SESSION_PASSWORD_HASH_ATTR, account.getPasswordHash());

        String sessionToken = dualSessionService.createSession(account);
        if (sessionToken != null) {
            String cookieName = customerOnly ? DualSessionService.CUSTOMER_COOKIE : DualSessionService.ADMIN_COOKIE;
            ResponseCookie cookie = ResponseCookie.from(cookieName, sessionToken)
                    .path("/")
                    .httpOnly(true)
                    .sameSite("Lax")
                    .maxAge(java.time.Duration.ofDays(7))
                    .secure(false)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        return user;
    }

    private static String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (var cookie : request.getCookies()) {
            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }

    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        return authService.currentUser(authentication.getName());
    }
}
