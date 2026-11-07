package com.example.booking_nail;

import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.seed-data.enabled=true",
        "spring.datasource.url=jdbc:h2:mem:seeded_test;MODE=MySQL;DB_CLOSE_DELAY=-1"
})
class RolePermissionsIntegrationTests {
    @LocalServerPort private int port;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder encoder;

    private User account(String role) {
        var user = new User();
        user.setFullName("Permission Test " + role);
        user.setEmail("permission-" + role.toLowerCase() + "@example.com");
        user.setRole(roles.findByCode(role).orElseThrow());
        user.setStatus("ACTIVE");
        user.setPasswordHash(encoder.encode("PermissionTest!2026"));
        return users.save(user);
    }

    private String firstId(String json) {
        var matcher = Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(json);
        assertTrue(matcher.find(), "Expected an id in JSON: " + json);
        return matcher.group(1);
    }

    @Test
    void receptionistCanReadCatalogButCannotMutateOrManageAccounts() throws Exception {
        var admin = AuthenticatedApiClient.admin(port);
        String beforeServices = admin.request("GET", "/api/services", null).body();
        String beforeCategories = admin.request("GET", "/api/categories", null).body();
        String userId = firstId(admin.request("GET", "/users", null).body());
        long beforeUsers = users.count();

        User user = account("RECEPTIONIST");
        try {
            var api = new AuthenticatedApiClient(port);
            assertEquals(200, api.login(user.getEmail(), "PermissionTest!2026").statusCode());
            assertTrue(api.request("GET", "/api/auth/me", null).body().contains("\"roleCode\":\"RECEPTIONIST\""));
            for (String path : new String[]{"/api/services", "/api/categories"}) {
                var list = api.request("GET", path, null);
                assertEquals(200, list.statusCode(), path);
                String id = firstId(list.body());
                assertEquals(200, api.request("GET", path + "/" + id, null).statusCode());
                assertEquals(200, api.request("HEAD", path + "/" + id, null).statusCode());
                for (String method : new String[]{"POST", "PUT", "DELETE", "PATCH"}) {
                    String target = method.equals("POST") ? path : path + "/" + id;
                    var denied = api.request(method, target, "{}");
                    assertEquals(403, denied.statusCode(), method + target + denied.body());
                    assertTrue(denied.body().contains("FORBIDDEN"));
                }
            }
            for (String path : new String[]{"/users", "/users/" + userId, "/api/roles", "/api/roles/1"}) {
                assertEquals(403, api.request("GET", path, null).statusCode(), path);
            }
            assertEquals(403, api.request("POST", "/users", "{}").statusCode());
            assertEquals(403, api.request("PUT", "/users/" + userId, "{}").statusCode());
            assertEquals(403, api.request("DELETE", "/users/" + userId, null).statusCode());
            assertEquals(403, api.uploadUser("PUT", "/users/" + userId, "{}", new byte[]{1}, "image/png", "photo.png").statusCode());
            assertEquals(204, api.request("POST", "/api/auth/logout", null).statusCode());
            assertEquals(401, api.request("GET", "/api/appointments", null).statusCode());
        } finally {
            users.deleteById(user.getId());
        }
        assertEquals(beforeUsers, users.count());
        assertEquals(beforeServices, admin.request("GET", "/api/services", null).body());
        assertEquals(beforeCategories, admin.request("GET", "/api/categories", null).body());
    }

    @Test
    void demotionRemovesCatalogWritePermissionOnTheExistingSession() throws Exception {
        User user = account("ADMIN");
        try {
            var api = new AuthenticatedApiClient(port);
            assertEquals(200, api.login(user.getEmail(), "PermissionTest!2026").statusCode());
            assertEquals(200, api.request("GET", "/users", null).statusCode());
            user.setRole(roles.findByCode("RECEPTIONIST").orElseThrow());
            users.save(user);
            assertEquals(403, api.request("POST", "/api/services", "{}").statusCode());
            assertEquals(403, api.request("POST", "/api/categories", "{}").statusCode());
            assertEquals(403, api.request("GET", "/users", null).statusCode());
            assertEquals(200, api.request("GET", "/api/services", null).statusCode());
        } finally {
            users.deleteById(user.getId());
        }
    }

    @Test
    void undeclaredApiPathsAndMethodsAreDeniedEvenForAdmin() throws Exception {
        var api = AuthenticatedApiClient.admin(port);
        for (String path : new String[]{"/api/unconfigured", "/api/appointment", "/api/services/1/extra"}) {
            assertEquals(403, api.request("GET", path, null).statusCode(), path);
        }
        assertEquals(403, api.request("PATCH", "/api/services/1", "{}").statusCode());
        assertEquals(403, api.request("POST", "/api/avatars/example.png", "{}").statusCode());
    }
}
