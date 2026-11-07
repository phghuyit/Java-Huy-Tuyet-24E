package com.example.booking_nail;

import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class UserAccountIntegrationTests {
    @LocalServerPort private int port;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder encoder;
    private AuthenticatedApiClient admin;

    @BeforeEach
    void signIn() throws Exception {
        admin = AuthenticatedApiClient.admin(port);
    }

    private String body(User user, String extra) {
        return "{\"fullName\":\"Account Test\",\"email\":\"" + user.getEmail() + "\",\"phone\":null" + extra + "}";
    }

    private User createAccount(String suffix) throws Exception {
        String email = "account-" + suffix + "@example.com";
        long roleId = roles.findByCode("RECEPTIONIST").orElseThrow().getId();
        var response = admin.request("POST", "/users", "{\"fullName\":\"Account Test\",\"email\":\"" + email
                + "\",\"phone\":null,\"roleId\":" + roleId + ",\"password\":\"AccountPass!2026\",\"status\":\"ACTIVE\",\"avatarUrl\":\"https://example.com/avatar.jpg\"}");
        assertEquals(201, response.statusCode(), response.body());
        return users.findByEmailIgnoreCase(email).orElseThrow();
    }

    @Test
    void createsLoginAccountAndReturnsMetadataWithoutPasswordSecrets() throws Exception {
        User user = createAccount("create");
        try {
            assertTrue(encoder.matches("AccountPass!2026", user.getPasswordHash()));
            assertNull(user.getPhone());
            var response = admin.request("GET", "/users/" + user.getId(), null);
            assertTrue(response.body().contains("\"hasPassword\":true"));
            assertTrue(response.body().contains("\"roleCode\":\"RECEPTIONIST\""));
            assertTrue(response.body().contains("https://example.com/avatar.jpg"));
            assertTrue(response.body().contains("\"createdAt\":"));
            assertTrue(response.body().contains("\"updatedAt\":"));
            assertFalse(response.body().contains("passwordHash"));
            assertFalse(response.body().contains("AccountPass!2026"));
            assertEquals(200, new AuthenticatedApiClient(port).login(user.getEmail(), "AccountPass!2026").statusCode());
        } finally { users.delete(user); }
    }

    @Test
    void blankPasswordPreservesHashAndResetRevokesExistingSessions() throws Exception {
        User user = createAccount("password");
        try {
            var sessionClient = new AuthenticatedApiClient(port);
            assertEquals(200, sessionClient.login(user.getEmail(), "AccountPass!2026").statusCode());
            String hash = user.getPasswordHash();
            assertEquals(200, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"password\":\"\"")).statusCode());
            assertEquals(hash, users.findById(user.getId()).orElseThrow().getPasswordHash());
            assertEquals(200, sessionClient.request("GET", "/api/auth/me", null).statusCode());
            assertEquals(200, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"password\":\"Replacement!2026\"")).statusCode());
            assertEquals(401, sessionClient.request("GET", "/api/appointments", null).statusCode());
            assertEquals(401, new AuthenticatedApiClient(port).login(user.getEmail(), "AccountPass!2026").statusCode());
            assertEquals(200, new AuthenticatedApiClient(port).login(user.getEmail(), "Replacement!2026").statusCode());
        } finally { users.deleteById(user.getId()); }
    }

    @Test
    void manualLockRevokesSessionAndReactivateClearsFailedAttempts() throws Exception {
        User user = createAccount("manual-lock");
        try {
            var sessionClient = new AuthenticatedApiClient(port);
            assertEquals(200, sessionClient.login(user.getEmail(), "AccountPass!2026").statusCode());
            assertEquals(200, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"status\":\"LOCKED\"")).statusCode());
            assertEquals(401, sessionClient.request("GET", "/api/appointments", null).statusCode());
            assertEquals(401, sessionClient.login(user.getEmail(), "AccountPass!2026").statusCode());
            assertEquals(200, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"status\":\"ACTIVE\"")).statusCode());
            assertEquals(200, sessionClient.login(user.getEmail(), "AccountPass!2026").statusCode());
        } finally { users.deleteById(user.getId()); }
    }

    @Test
    void invalidFieldsDoNotPartiallyChangeProfileOrPassword() throws Exception {
        User user = createAccount("invalid");
        try {
            for (String extra : List.of(
                    ",\"password\":\"short\"", ",\"password\":\"" + "ặ".repeat(25) + "\"",
                    ",\"status\":\"UNKNOWN\"", ",\"avatarUrl\":\"javascript:alert(1)\"",
                    ",\"avatarUrl\":\"https://user:secret@example.com/avatar.jpg\"")) {
                assertEquals(400, admin.request("PUT", "/users/" + user.getId(), body(user, extra)).statusCode());
                User unchanged = users.findById(user.getId()).orElseThrow();
                assertEquals(user.getPasswordHash(), unchanged.getPasswordHash());
                assertEquals(user.getAvatarUrl(), unchanged.getAvatarUrl());
                assertEquals("ACTIVE", unchanged.getStatus());
            }
            assertEquals(200, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"avatarUrl\":\"\"")).statusCode());
            assertNull(users.findById(user.getId()).orElseThrow().getAvatarUrl());
        } finally { users.deleteById(user.getId()); }
    }

    @Test
    void lastAdminCannotBeLockedDemotedOrDeleted() throws Exception {
        User user = users.findByEmailIgnoreCase("integration-admin@example.com").orElseThrow();
        long staffRole = roles.findByCode("STAFF").orElseThrow().getId();
        assertEquals(409, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"status\":\"LOCKED\"")).statusCode());
        assertEquals(409, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"roleId\":" + staffRole)).statusCode());
        assertEquals(409, admin.request("DELETE", "/users/" + user.getId(), null).statusCode());
        assertEquals(200, admin.request("GET", "/api/auth/me", null).statusCode());
    }

    @Test
    void anotherAdminAllowsLockOrDeleteWithoutRemovingLastAdmin() throws Exception {
        User user = createAccount("extra-admin");
        try {
            long roleId = roles.findByCode("ADMIN").orElseThrow().getId();
            assertEquals(200, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"roleId\":" + roleId)).statusCode());
            assertEquals(200, admin.request("PUT", "/users/" + user.getId(), body(user, ",\"status\":\"LOCKED\"")).statusCode());
            assertEquals(204, admin.request("DELETE", "/users/" + user.getId(), null).statusCode());
            assertEquals(200, admin.request("GET", "/api/auth/me", null).statusCode());
        } finally { users.findByEmailIgnoreCase(user.getEmail()).ifPresent(users::delete); }
    }
}
