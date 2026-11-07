package com.example.booking_nail.config;

import com.example.booking_nail.controller.AuthController;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.UserRepository;
import com.example.booking_nail.service.AuthService;
import com.example.booking_nail.service.DualSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.SecurityContextHolderFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthService authService, PasswordEncoder passwordEncoder) {
        var provider = new DaoAuthenticationProvider(authService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:[*]", "http://127.0.0.1:[*]", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, UserRepository userRepository, DualSessionService dualSessionService) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .addFilterAfter(sessionRevalidationFilter(userRepository, dualSessionService), SecurityContextHolderFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) ->
                                writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHENTICATED", "Vui lòng đăng nhập để tiếp tục"))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, "FORBIDDEN", "Tài khoản không có quyền thực hiện thao tác này"))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/login",
                                "/api/auth/client/login",
                                "/api/auth/client/register",
                                "/api/auth/client/logout",
                                "/api/auth/logout",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/reset-password/verify").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()

                        .requestMatchers(HttpMethod.GET,
                                "/api/services", "/api/services/*", "/api/services/slug/*",
                                "/api/categories", "/api/categories/*",
                                "/api/staff", "/api/staff/*",
                                "/api/reviews", "/api/reviews/*", "/api/reviews/appointment/*", "/api/reviews/staff/*/average",
                                "/api/lookbook",
                                "/api/coupons", "/api/coupons/*", "/api/coupons/code/*",
                                "/api/appointments/busy-slots",
                                "/api/appointments/lookup").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/avatars/*").authenticated()
                        .requestMatchers(HttpMethod.HEAD, "/api/services/*", "/api/categories/*").permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/api/coupons/validate",
                                "/api/appointments",
                                "/api/appointments/lookup",
                                "/api/appointments/lookup/cancel",
                                "/api/waitlist").permitAll()

                        .requestMatchers("/api/profile", "/api/profile/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/appointments/my").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/reviews").authenticated()

                        .requestMatchers(HttpMethod.GET,
                                "/api/appointments", "/api/appointments/*",
                                "/api/waitlist", "/api/waitlist/*",
                                "/api/products", "/api/products/*",
                                "/api/stocks", "/api/inventory/transactions").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.POST, "/api/stocks", "/api/inventory/transactions").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/*", "/api/waitlist/*").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/*/status", "/api/appointments/*/payment").hasAnyRole("ADMIN", "RECEPTIONIST")
                        .requestMatchers(HttpMethod.DELETE, "/api/waitlist/*").hasAnyRole("ADMIN", "RECEPTIONIST")

                        .requestMatchers(HttpMethod.GET, "/users", "/users/*", "/api/roles", "/api/roles/*", "/api/trash").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,
                                "/users",
                                "/api/services",
                                "/api/categories",
                                "/api/products",
                                "/api/coupons",
                                "/api/staff",
                                "/api/lookbook",
                                "/api/trash/restore/*/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,
                                "/users/*",
                                "/api/services/*",
                                "/api/categories/*",
                                "/api/products/*",
                                "/api/coupons/*",
                                "/api/staff/*",
                                "/api/reviews/*").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE,
                                "/users/*",
                                "/api/services/*",
                                "/api/categories/*",
                                "/api/products/*",
                                "/api/coupons/*",
                                "/api/staff/*",
                                "/api/reviews/*",
                                "/api/trash/*/*").hasRole("ADMIN")

                        .anyRequest().denyAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(false)
                        .deleteCookies("JSESSIONID", DualSessionService.ADMIN_COOKIE)
                        .addLogoutHandler((request, response, authentication) -> {
                            String adminCookie = getCookieValue(request, DualSessionService.ADMIN_COOKIE);
                            if (adminCookie != null) {
                                dualSessionService.removeSession(adminCookie);
                            }
                        })
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
                .build();
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

    private OncePerRequestFilter sessionRevalidationFilter(UserRepository userRepository, DualSessionService dualSessionService) {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                    throws ServletException, IOException {

                if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String adminCookie = getCookieValue(request, DualSessionService.ADMIN_COOKIE);
                String customerCookie = getCookieValue(request, DualSessionService.CUSTOMER_COOKIE);

                String scope = request.getHeader("X-Auth-Scope");
                String uri = request.getRequestURI();
                String method = request.getMethod();

                boolean isExplicitAdmin = "admin".equalsIgnoreCase(scope);
                boolean isExplicitCustomer = "customer".equalsIgnoreCase(scope);

                boolean isAdminPath = uri.startsWith("/users")
                        || uri.startsWith("/api/roles")
                        || uri.startsWith("/api/trash")
                        || uri.startsWith("/api/stocks")
                        || uri.startsWith("/api/inventory")
                        || ((!"GET".equalsIgnoreCase(method) && !"HEAD".equalsIgnoreCase(method))
                        && (uri.startsWith("/api/services") || uri.startsWith("/api/categories")
                        || uri.startsWith("/api/products") || uri.startsWith("/api/coupons")
                        || uri.startsWith("/api/staff") || uri.startsWith("/api/reviews")
                        || uri.startsWith("/api/lookbook")));

                boolean isCustomerPath = uri.startsWith("/api/profile")
                        || uri.equals("/api/appointments/my")
                        || uri.equals("/api/auth/client/logout");

                if (isExplicitCustomer || (!isExplicitAdmin && isCustomerPath)) {
                    // Strict Customer resolution: only check CUSTOMER_SESSION cookie
                    if (customerCookie != null) {
                        DualSessionService.SessionData sessionData = dualSessionService.getSession(customerCookie);
                        if (sessionData != null) {
                            var found = userRepository.findById(sessionData.userId());
                            if (found.isPresent()) {
                                User user = found.get();
                                if ("ACTIVE".equalsIgnoreCase(user.getStatus())
                                        && user.getRole() != null
                                        && "CUSTOMER".equalsIgnoreCase(user.getRole().getCode())
                                        && Objects.equals(user.getPasswordHash(), sessionData.passwordHash())) {
                                    var updatedAuth = UsernamePasswordAuthenticationToken.authenticated(
                                            user.getEmail(),
                                            null,
                                            List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                                    );
                                    SecurityContextHolder.getContext().setAuthentication(updatedAuth);
                                    filterChain.doFilter(request, response);
                                    return;
                                }
                            }
                        }
                    }
                    // If customer session is invalid or missing, never fall back to admin session
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                if (isExplicitAdmin || (!isExplicitCustomer && isAdminPath)) {
                    // Strict Admin resolution: only check ADMIN_SESSION cookie
                    if (adminCookie != null) {
                        DualSessionService.SessionData sessionData = dualSessionService.getSession(adminCookie);
                        if (sessionData != null) {
                            var found = userRepository.findById(sessionData.userId());
                            if (found.isPresent()) {
                                User user = found.get();
                                if ("ACTIVE".equalsIgnoreCase(user.getStatus())
                                        && user.getRole() != null
                                        && !"STAFF".equalsIgnoreCase(user.getRole().getCode())
                                        && Objects.equals(user.getPasswordHash(), sessionData.passwordHash())) {
                                    String currentRole = "ROLE_" + user.getRole().getCode().toUpperCase();
                                    var updatedAuth = UsernamePasswordAuthenticationToken.authenticated(
                                            user.getEmail(),
                                            null,
                                            List.of(new SimpleGrantedAuthority(currentRole))
                                    );
                                    SecurityContextHolder.getContext().setAuthentication(updatedAuth);
                                    filterChain.doFilter(request, response);
                                    return;
                                }
                            }
                        }
                    }
                    // If admin session is invalid or missing, never fall back to customer session
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }

                // Neutral paths (e.g. tests or general endpoints without explicit scope)
                if (adminCookie != null) {
                    DualSessionService.SessionData sessionData = dualSessionService.getSession(adminCookie);
                    if (sessionData != null) {
                        var found = userRepository.findById(sessionData.userId());
                        if (found.isPresent()) {
                            User user = found.get();
                            if ("ACTIVE".equalsIgnoreCase(user.getStatus())
                                    && user.getRole() != null
                                    && !"STAFF".equalsIgnoreCase(user.getRole().getCode())
                                    && Objects.equals(user.getPasswordHash(), sessionData.passwordHash())) {
                                String currentRole = "ROLE_" + user.getRole().getCode().toUpperCase();
                                var updatedAuth = UsernamePasswordAuthenticationToken.authenticated(
                                        user.getEmail(),
                                        null,
                                        List.of(new SimpleGrantedAuthority(currentRole))
                                );
                                SecurityContextHolder.getContext().setAuthentication(updatedAuth);
                                filterChain.doFilter(request, response);
                                return;
                            }
                        }
                    }
                }

                if (customerCookie != null) {
                    DualSessionService.SessionData sessionData = dualSessionService.getSession(customerCookie);
                    if (sessionData != null) {
                        var found = userRepository.findById(sessionData.userId());
                        if (found.isPresent()) {
                            User user = found.get();
                            if ("ACTIVE".equalsIgnoreCase(user.getStatus())
                                    && user.getRole() != null
                                    && "CUSTOMER".equalsIgnoreCase(user.getRole().getCode())
                                    && Objects.equals(user.getPasswordHash(), sessionData.passwordHash())) {
                                var updatedAuth = UsernamePasswordAuthenticationToken.authenticated(
                                        user.getEmail(),
                                        null,
                                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
                                );
                                SecurityContextHolder.getContext().setAuthentication(updatedAuth);
                                filterChain.doFilter(request, response);
                                return;
                            }
                        }
                    }
                }

                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                    var found = userRepository.findByEmailIgnoreCase(auth.getName());
                    HttpSession session = request.getSession(false);
                    String sessionHash = session != null
                            ? (String) session.getAttribute(AuthController.SESSION_PASSWORD_HASH_ATTR)
                            : null;

                    boolean valid = found.isPresent();
                    User user = found.orElse(null);
                    if (valid) {
                        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())
                                || user.getRole() == null
                                || "STAFF".equalsIgnoreCase(user.getRole().getCode())) {
                            valid = false;
                        } else if (sessionHash != null && !Objects.equals(sessionHash, user.getPasswordHash())) {
                            valid = false;
                        }
                    }

                    if (!valid) {
                        if (session != null) {
                            session.invalidate();
                        }
                        SecurityContextHolder.clearContext();
                        writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHENTICATED", "Phiên đăng nhập đã hết hiệu lực");
                        return;
                    }

                    String currentRole = "ROLE_" + user.getRole().getCode().toUpperCase();
                    var updatedAuth = UsernamePasswordAuthenticationToken.authenticated(
                            user.getEmail(),
                            null,
                            List.of(new SimpleGrantedAuthority(currentRole))
                    );
                    SecurityContextHolder.getContext().setAuthentication(updatedAuth);
                }
                filterChain.doFilter(request, response);
            }
        };
    }

    private static void writeJsonError(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(
                "{\"status\":" + status + ",\"code\":\"" + code + "\",\"detail\":\"" + message + "\",\"message\":\"" + message + "\"}"
        );
    }
}
