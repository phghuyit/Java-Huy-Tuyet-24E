package com.example.booking_nail;

import com.example.booking_nail.entity.User;
import com.example.booking_nail.seeder.AdminAccountInitializer;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthApiIntegrationTests {
    @LocalServerPort
    private int port;
    @Autowired
    private UserRepository users;
    @Autowired
    private RoleRepository roles;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private AdminAccountInitializer initializer;

    @Test
    void roleChangesLocksAndDeletionTakeEffectOnExistingSessions() throws Exception {
        User user = account("session-change@example.com", "ADMIN", "ACTIVE");
        try {
            var api = new AuthenticatedApiClient(port);
            assertEquals(200, api.login(user.getEmail(), "AccountLogin!2026").statusCode());
            assertEquals(200, api.request("GET", "/users", null).statusCode());
            user.setRole(roles.findByCode("RECEPTIONIST").orElseThrow());
            users.save(user);
            assertEquals(403, api.request("GET", "/users", null).statusCode());
            assertTrue(api.request("GET", "/api/auth/me", null).body().contains("\"roleCode\":\"RECEPTIONIST\""));
            user.setStatus("LOCKED");
            users.save(user);
            assertEquals(401, api.request("GET", "/api/appointments", null).statusCode());
            assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
            user.setStatus("ACTIVE");
            users.save(user);
            assertEquals(200, api.login(user.getEmail(), "AccountLogin!2026").statusCode());
            users.delete(user);
            assertEquals(401, api.request("GET", "/api/appointments", null).statusCode());
        } finally {
            users.findByEmailIgnoreCase("session-change@example.com").ifPresent(users::delete);
        }
    }

    @Test
    void bootstrapDoesNotResetExistingAdminPasswordOrCreateDuplicates() {
        User admin = users.findByEmailIgnoreCase("integration-admin@example.com").orElseThrow();
        String originalHash = admin.getPasswordHash();
        long before = users.count();
        String replacement = encoder.encode("ChangedByAdmin!2026");
        try {
            admin.setPasswordHash(replacement);
            users.save(admin);
            initializer.run();
            initializer.run();
            assertEquals(before, users.count());
            assertEquals(replacement, users.findByEmailIgnoreCase(admin.getEmail()).orElseThrow().getPasswordHash());
        } finally {
            admin.setPasswordHash(originalHash);
            users.save(admin);
        }
    }

    @Test
    void anonymousUsersCannotReadOrWriteManagementApis() throws Exception {
        var api = new AuthenticatedApiClient(port);
        for (String path : new String[]{"/users", "/api/roles", "/api/appointments", "/api/products", "/api/auth/me"}) {
            var response = api.request("GET", path, null);
            assertEquals(401, response.statusCode(), path + response.body());
            assertTrue(response.body().contains("UNAUTHENTICATED"));
            assertTrue(response.headers().firstValue("Location").isEmpty());
        }
        assertEquals(401, api.request("POST", "/users", "{}").statusCode());
    }

    @Test
    void loginRotatesSessionUsesHttpOnlyCookieAndLogoutInvalidatesIt() throws Exception {
        var api = new AuthenticatedApiClient(port);
        var firstLogin = api.login("  INTEGRATION-ADMIN@EXAMPLE.COM  ", "IntegrationLogin!2026");
        assertEquals(200, firstLogin.statusCode(), firstLogin.body());
        String before = api.cookies.getCookieStore().getCookies().stream()
                .filter(cookie -> "JSESSIONID".equals(cookie.getName())).findFirst().orElseThrow().getValue();
        var login = api.login("  INTEGRATION-ADMIN@EXAMPLE.COM  ", "IntegrationLogin!2026");
        assertEquals(200, login.statusCode(), login.body());
        assertTrue(login.body().contains("\"roleCode\":\"ADMIN\""));
        assertFalse(login.body().toLowerCase().contains("password"));
        assertFalse(login.body().contains("token"));
        var cookie = api.cookies.getCookieStore().getCookies().stream()
                .filter(value -> "JSESSIONID".equals(value.getName())).findFirst().orElseThrow();
        assertTrue(cookie.isHttpOnly());
        assertNotEquals(before, cookie.getValue());
        String oldCookie = cookie.getValue();
        assertEquals(200, api.request("GET", "/api/auth/me", null).statusCode());
        assertEquals(200, api.request("GET", "/users", null).statusCode());
        assertEquals(204, api.request("POST", "/api/auth/logout", null).statusCode());
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
        var replay = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/users"))
                .header("Cookie", "JSESSIONID=" + oldCookie).GET().build();
        assertEquals(401, HttpClient.newHttpClient().send(replay, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    @Test
    void wrongPasswordAndUnknownEmailHaveSameErrorAndNoAuthenticatedSession() throws Exception {
        var api = new AuthenticatedApiClient(port);
        var wrong = api.login("integration-admin@example.com", "WrongPassword123!");
        var unknown = api.login("does-not-exist@example.com", "WrongPassword123!");
        assertEquals(401, wrong.statusCode());
        assertEquals(401, unknown.statusCode());
        assertEquals(AuthenticatedApiClient.field(wrong.body(), "detail"), AuthenticatedApiClient.field(unknown.body(), "detail"));
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
    }

    @Test
    void malformedLoginIsRejected() throws Exception {
        var api = new AuthenticatedApiClient(port);
        for (String body : new String[]{"{}", "{\"email\":\"invalid\",\"password\":\"secret\"}",
                "{\"email\":\"integration-admin@example.com\",\"password\":\"\"}",
                "{\"email\":\"integration-admin@example.com\",\"password\":\"" + "a".repeat(73) + "\"}"}) {
            assertEquals(400, api.request("POST", "/api/auth/login", body).statusCode());
        }
    }

    @Test
    void disabledProfilesWithoutPasswordsStaffAndCustomersCannotEnterAdmin() throws Exception {
        User locked = account("locked-login@example.com", "ADMIN", "LOCKED");
        User profile = account("profile-login@example.com", "ADMIN", "ACTIVE");
        profile.setPasswordHash(null);
        users.save(profile);
        User staff = account("staff-blocked@example.com", "STAFF", "ACTIVE");
        User customer = account("customer-login@example.com", "CUSTOMER", "ACTIVE");
        try {
            var api = new AuthenticatedApiClient(port);
            assertEquals(401, api.login(locked.getEmail(), "AccountLogin!2026").statusCode());
            assertEquals(401, api.login(profile.getEmail(), "AccountLogin!2026").statusCode());
            assertEquals(401, api.login(staff.getEmail(), "AccountLogin!2026").statusCode());
            assertEquals(403, api.login(customer.getEmail(), "AccountLogin!2026").statusCode());
            assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
        } finally {
            users.deleteAll(java.util.List.of(locked, profile, staff, customer));
        }
    }

    @Test
    void receptionistCanSignInButCannotManageUsersOrRoles() throws Exception {
        User receptionist = account("receptionist-login@example.com", "RECEPTIONIST", "ACTIVE");
        try {
            var api = new AuthenticatedApiClient(port);
            assertEquals(200, api.login(receptionist.getEmail(), "AccountLogin!2026").statusCode());
            assertEquals(200, api.request("GET", "/api/services", null).statusCode());
            assertEquals(200, api.request("GET", "/api/appointments", null).statusCode());
            assertEquals(403, api.request("GET", "/users", null).statusCode());
            assertEquals(403, api.request("POST", "/users", "{}").statusCode());
            assertEquals(403, api.request("GET", "/api/roles", null).statusCode());
        } finally {
            users.delete(receptionist);
        }
    }

    @Test
    void bootstrapStoresBcryptAndCorsAllowsCookiesOnlyFromConfiguredFrontend() throws Exception {
        User admin = users.findByEmailIgnoreCase("integration-admin@example.com").orElseThrow();
        assertNotEquals("IntegrationLogin!2026", admin.getPasswordHash());
        assertTrue(admin.getPasswordHash().startsWith("$2"));
        assertTrue(encoder.matches("IntegrationLogin!2026", admin.getPasswordHash()));
        for (String origin : new String[]{"http://localhost:3000", "https://untrusted.example"}) {
            var request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/login"))
                    .header("Origin", origin).header("Access-Control-Request-Method", "POST")
                    .header("Access-Control-Request-Headers", "content-type")
                    .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build();
            var response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (origin.equals("http://localhost:3000")) {
                assertEquals(200, response.statusCode());
                assertEquals(origin, response.headers().firstValue("Access-Control-Allow-Origin").orElse(""));
                assertEquals("true", response.headers().firstValue("Access-Control-Allow-Credentials").orElse(""));
            } else {
                assertEquals(403, response.statusCode());
                assertTrue(response.headers().firstValue("Access-Control-Allow-Origin").isEmpty());
            }
        }
    }

    private User account(String email, String role, String status) {
        User user = new User();
        user.setEmail(email);
        user.setFullName("Auth integration test");
        user.setPasswordHash(encoder.encode("AccountLogin!2026"));
        user.setRole(roles.findByCode(role).orElseThrow());
        user.setStatus(status);
        return users.save(user);
    }
}
