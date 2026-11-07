package com.example.booking_nail;

import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ClientAuthIntegrationTests {
    @LocalServerPort private int port;
    @Autowired private UserRepository users;
    @Autowired private RoleRepository roles;
    @Autowired private PasswordEncoder encoder;
    private final List<Long> created = new ArrayList<>();

    @AfterEach
    void cleanup() { for (Long id : created) if (users.existsById(id)) users.deleteById(id); }

    private String registration(String email, String extra) {
        return "{\"fullName\":\"  Khách VELA  \",\"email\":\"" + email
                + "\",\"password\":\"CustomerTest!2026\"" + extra + "}";
    }

    private User register(AuthenticatedApiClient api, String email) throws Exception {
        var response = api.request("POST", "/api/auth/client/register", registration(email, ""));
        assertEquals(201, response.statusCode(), response.body());
        var user = users.findByEmailIgnoreCase(email).orElseThrow();
        created.add(user.getId());
        return user;
    }

    private int login(AuthenticatedApiClient api, String email, String password) throws Exception {
        return api.request("POST", "/api/auth/client/login", "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}").statusCode();
    }

    @Test
    void registrationCannotChooseRoleAndCreatesBcryptCustomerWithRealSessionAndLogout() throws Exception {
        var api = new AuthenticatedApiClient(port);
        long adminId = roles.findByCode("ADMIN").orElseThrow().getId();
        String email = "client-registration@example.com";
        var registered = api.request("POST", "/api/auth/client/register", registration("  CLIENT-REGISTRATION@EXAMPLE.COM  ",
                ",\"roleId\":" + adminId + ",\"roleCode\":\"ADMIN\",\"status\":\"LOCKED\",\"passwordHash\":\"fake\""));
        assertEquals(201, registered.statusCode(), registered.body());
        User user = users.findByEmailIgnoreCase(email).orElseThrow();
        created.add(user.getId());
        assertEquals("CUSTOMER", user.getRole().getCode());
        assertEquals("ACTIVE", user.getStatus());
        assertEquals("Khách VELA", user.getFullName());
        assertNull(user.getPhone());
        assertTrue(encoder.matches("CustomerTest!2026", user.getPasswordHash()));
        assertFalse(registered.body().toLowerCase().contains("password"));
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
        assertEquals(200, login(api, "  CLIENT-REGISTRATION@EXAMPLE.COM  ", "CustomerTest!2026"));
        var me = api.request("GET", "/api/auth/me", null);
        assertEquals(200, me.statusCode(), me.body());
        assertEquals(email, AuthenticatedApiClient.field(me.body(), "email"));
        assertTrue(me.body().contains("CUSTOMER"));
        assertFalse(me.body().toLowerCase().contains("password"));
        assertTrue(api.cookies.getCookieStore().getCookies().stream().anyMatch(c -> c.getName().equals("JSESSIONID") && c.isHttpOnly()));
        for (String path : new String[]{"/users", "/users/" + user.getId(), "/api/roles", "/api/appointments", "/api/products"}) {
            assertEquals(403, api.request("GET", path, null).statusCode(), path);
        }
        assertEquals(403, api.request("POST", "/users", "{}").statusCode());
        assertEquals(403, api.request("PUT", "/users/" + user.getId(), "{}").statusCode());
        assertEquals(403, api.uploadUser("PUT", "/users/" + user.getId(), "{}", new byte[]{1}, "image/png", "avatar.png").statusCode());
        assertEquals(403, api.request("POST", "/api/services", "{}").statusCode());
        assertEquals(204, api.request("POST", "/api/auth/logout", null).statusCode());
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
    }

    @Test
    void rejectsInvalidRegistrationAndDuplicateEmailOrPhone() throws Exception {
        var api = new AuthenticatedApiClient(port);
        long count = users.count();
        String valid = registration("client-invalid@example.com", "");
        for (String invalid : new String[]{"{}", valid.replace("CustomerTest!2026", ""), valid.replace("CustomerTest!2026", "short"),
                valid.replace("CustomerTest!2026", "á".repeat(37)), valid.replace("client-invalid@example.com", "invalid"),
                valid.replace("  Khách VELA  ", " "), registration("client-invalid@example.com", ",\"phone\":\"abc\"")}) {
            assertEquals(400, api.request("POST", "/api/auth/client/register", invalid).statusCode());
        }
        assertEquals(count, users.count());
        var registered = api.request("POST", "/api/auth/client/register", registration("client-duplicate@example.com", ",\"phone\":\"0910020034\""));
        assertEquals(201, registered.statusCode(), registered.body());
        created.add(users.findByEmailIgnoreCase("client-duplicate@example.com").orElseThrow().getId());
        assertEquals(409, api.request("POST", "/api/auth/client/register", registration("  CLIENT-DUPLICATE@EXAMPLE.COM  ", "")).statusCode());
        assertEquals(409, api.request("POST", "/api/auth/client/register", registration("client-other@example.com", ",\"phone\":\"0910020034\"")).statusCode());
        assertEquals(count + 1, users.count());
    }

    @Test
    void registrationCannotTakeOverAnExistingProfileWithoutPassword() throws Exception {
        var profile = new User();
        profile.setEmail("client-profile@example.com");
        profile.setFullName("Existing profile");
        profile.setRole(roles.findByCode("CUSTOMER").orElseThrow());
        profile.setStatus("ACTIVE");
        profile = users.save(profile);
        created.add(profile.getId());
        var api = new AuthenticatedApiClient(port);
        assertEquals(409, api.request("POST", "/api/auth/client/register", registration(profile.getEmail(), "")).statusCode());
        var persisted = users.findById(profile.getId()).orElseThrow();
        assertNull(persisted.getPasswordHash());
        assertEquals("Existing profile", persisted.getFullName());
    }

    @Test
    void clientAndInternalLoginAreSeparate() throws Exception {
        var api = new AuthenticatedApiClient(port);
        String email = "client-boundary@example.com";
        register(api, email);
        assertEquals(403, api.login(email, "CustomerTest!2026").statusCode());
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
        assertEquals(403, login(api, "integration-admin@example.com", "IntegrationLogin!2026"));
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
        assertEquals(200, login(api, email, "CustomerTest!2026"));
    }

    @Test
    void clientLoginRevokesLockedOrChangedCredentials() throws Exception {
        var api = new AuthenticatedApiClient(port);
        User user = register(api, "client-lock@example.com");
        for (int i = 0; i < 5; i++) assertEquals(401, login(api, user.getEmail(), "WrongPassword!2026"));
        assertEquals(200, login(api, user.getEmail(), "CustomerTest!2026"));
        user = users.findById(user.getId()).orElseThrow();
        user.setStatus("LOCKED"); users.save(user);
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
        user.setStatus("ACTIVE"); users.save(user);
        assertEquals(200, login(api, user.getEmail(), "CustomerTest!2026"));
        user.setPasswordHash(encoder.encode("Replacement!2026")); users.save(user);
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
        assertEquals(200, login(api, user.getEmail(), "Replacement!2026"));
        users.deleteById(user.getId());
        assertEquals(401, api.request("GET", "/api/auth/me", null).statusCode());
    }
}
