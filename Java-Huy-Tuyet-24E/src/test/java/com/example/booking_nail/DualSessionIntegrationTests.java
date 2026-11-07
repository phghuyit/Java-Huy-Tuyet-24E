package com.example.booking_nail;

import com.example.booking_nail.entity.Role;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import com.example.booking_nail.service.DualSessionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class DualSessionIntegrationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private DualSessionService dualSessionService;

    private final List<Long> createdUserIds = new ArrayList<>();

    private User adminUser;
    private User customerUser;

    @BeforeEach
    void setUp() {
        Role adminRole = roleRepository.findByCode("ADMIN").orElseThrow();
        Role customerRole = roleRepository.findByCode("CUSTOMER").orElseThrow();

        adminUser = new User();
        adminUser.setEmail("dual-admin@test.com");
        adminUser.setFullName("Dual Test Admin");
        adminUser.setPasswordHash(passwordEncoder.encode("AdminPass!2026"));
        adminUser.setRole(adminRole);
        adminUser.setStatus("ACTIVE");
        adminUser = userRepository.save(adminUser);
        createdUserIds.add(adminUser.getId());

        customerUser = new User();
        customerUser.setEmail("dual-customer@test.com");
        customerUser.setFullName("Dual Test Customer");
        customerUser.setPasswordHash(passwordEncoder.encode("CustPass!2026"));
        customerUser.setRole(customerRole);
        customerUser.setStatus("ACTIVE");
        customerUser = userRepository.save(customerUser);
        createdUserIds.add(customerUser.getId());
    }

    @AfterEach
    void tearDown() {
        for (Long id : createdUserIds) {
            userRepository.deleteById(id);
        }
        createdUserIds.clear();
    }

    @Test
    void testStatelessSignedTokensSurviveServiceRestart() {
        String token = dualSessionService.createSession(adminUser);
        assertNotNull(token);
        assertTrue(token.contains("."));

        DualSessionService.SessionData sessionData = dualSessionService.getSession(token);
        assertNotNull(sessionData);
        assertEquals(adminUser.getId(), sessionData.userId());
        assertEquals("ADMIN", sessionData.roleCode());
        assertFalse(sessionData.isExpired());

        // Create a new instance of DualSessionService (simulating server restart)
        DualSessionService freshService = new DualSessionService();
        DualSessionService.SessionData restoredData = freshService.getSession(token);
        assertNotNull(restoredData);
        assertEquals(adminUser.getId(), restoredData.userId());
        assertEquals("ADMIN", restoredData.roleCode());
    }

    @Test
    void testSimultaneousAdminAndCustomerSessionsDoNotConflict() throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        // 1. Admin logs in
        HttpRequest adminLoginReq = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"dual-admin@test.com\",\"password\":\"AdminPass!2026\"}"))
                .build();
        HttpResponse<String> adminLoginRes = client.send(adminLoginReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, adminLoginRes.statusCode());

        String adminToken = extractCookieValue(adminLoginRes, DualSessionService.ADMIN_COOKIE);
        assertNotNull(adminToken);

        // 2. Customer logs in
        HttpRequest custLoginReq = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/client/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"email\":\"dual-customer@test.com\",\"password\":\"CustPass!2026\"}"))
                .build();
        HttpResponse<String> custLoginRes = client.send(custLoginReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, custLoginRes.statusCode());

        String custToken = extractCookieValue(custLoginRes, DualSessionService.CUSTOMER_COOKIE);
        assertNotNull(custToken);

        // 3. Combined cookie string representing the browser having BOTH sessions simultaneously
        String dualCookies = DualSessionService.ADMIN_COOKIE + "=" + adminToken + "; "
                + DualSessionService.CUSTOMER_COOKIE + "=" + custToken;

        // 4. Request with X-Auth-Scope: admin must resolve to ADMIN
        HttpRequest adminScopeReq = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/me"))
                .header("Cookie", dualCookies)
                .header("X-Auth-Scope", "admin")
                .GET()
                .build();
        HttpResponse<String> adminScopeRes = client.send(adminScopeReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, adminScopeRes.statusCode());
        assertTrue(adminScopeRes.body().contains("dual-admin@test.com"));
        assertTrue(adminScopeRes.body().contains("\"roleCode\":\"ADMIN\""));

        // 5. Request with X-Auth-Scope: customer must resolve to CUSTOMER
        HttpRequest custScopeReq = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/me"))
                .header("Cookie", dualCookies)
                .header("X-Auth-Scope", "customer")
                .GET()
                .build();
        HttpResponse<String> custScopeRes = client.send(custScopeReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, custScopeRes.statusCode());
        assertTrue(custScopeRes.body().contains("dual-customer@test.com"));
        assertTrue(custScopeRes.body().contains("\"roleCode\":\"CUSTOMER\""));

        // 6. Admin path (/users) with dual cookies and X-Auth-Scope: admin must succeed (200)
        HttpRequest adminUsersReq = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/users"))
                .header("Cookie", dualCookies)
                .header("X-Auth-Scope", "admin")
                .GET()
                .build();
        assertEquals(200, client.send(adminUsersReq, HttpResponse.BodyHandlers.ofString()).statusCode());

        // 7. Admin path (/users) with dual cookies and X-Auth-Scope: customer must be forbidden (403)
        HttpRequest custUsersReq = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/users"))
                .header("Cookie", dualCookies)
                .header("X-Auth-Scope", "customer")
                .GET()
                .build();
        assertEquals(403, client.send(custUsersReq, HttpResponse.BodyHandlers.ofString()).statusCode());

        // 8. Customer path (/api/profile) with dual cookies and X-Auth-Scope: customer must return CUSTOMER profile
        HttpRequest custProfileReq = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/profile"))
                .header("Cookie", dualCookies)
                .header("X-Auth-Scope", "customer")
                .GET()
                .build();
        HttpResponse<String> custProfileRes = client.send(custProfileReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, custProfileRes.statusCode());
        assertTrue(custProfileRes.body().contains("dual-customer@test.com"));
        assertFalse(custProfileRes.body().contains("dual-admin@test.com"));
    }

    private String extractCookieValue(HttpResponse<?> response, String cookieName) {
        for (String setCookieHeader : response.headers().allValues("Set-Cookie")) {
            for (String part : setCookieHeader.split(";")) {
                String trimmed = part.trim();
                if (trimmed.startsWith(cookieName + "=")) {
                    return trimmed.substring((cookieName + "=").length());
                }
            }
        }
        return null;
    }
}
