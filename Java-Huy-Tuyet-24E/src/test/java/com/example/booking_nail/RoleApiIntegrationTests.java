package com.example.booking_nail;

import com.example.booking_nail.entity.Role;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import com.example.booking_nail.seeder.RoleDataInitializer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class RoleApiIntegrationTests {
    @LocalServerPort
    private int port;
    @Autowired
    private RoleRepository roles;
    @Autowired
    private UserRepository users;
    @Autowired
    private RoleDataInitializer initializer;
    private AuthenticatedApiClient api;

    @BeforeEach
    void signIn() throws Exception {
        api = AuthenticatedApiClient.admin(port);
    }

    private HttpResponse<String> request(String method, String path, String body) throws Exception {
        return api.request(method, path, body);
    }

    @Test
    void listsFourRolesAndReturnsNotFoundForUnknownRole() throws Exception {
        var response = request("GET", "/api/roles", null);
        assertEquals(200, response.statusCode());
        for (String code : new String[]{"ADMIN", "RECEPTIONIST", "STAFF", "CUSTOMER"}) {
            assertTrue(response.body().contains("\"code\":\"" + code + "\""));
        }
        assertEquals(4, roles.count());
        assertEquals(404, request("GET", "/api/roles/999999", null).statusCode());
        assertEquals(400, request("GET", "/api/roles/0", null).statusCode());
    }

    @Test
    void createsDefaultRoleUpdatesRoleAndPreservesItWhenOmitted() throws Exception {
        String body = """
                {"fullName":"Role Test","email":"role-test@example.com","phone":"0976543210"}
                """;
        Long id = null;
        try {
            var created = request("POST", "/users", body);
            assertEquals(201, created.statusCode(), created.body());
            assertTrue(created.body().contains("\"roleCode\":\"CUSTOMER\""));
            User user = users.findAll().stream().filter(u -> "role-test@example.com".equals(u.getEmail()))
                    .findFirst().orElseThrow();
            id = user.getId();
            Role staff = roles.findByCode("STAFF").orElseThrow();
            String withRole = body.strip().replace("}", ",\"roleId\":" + staff.getId() + "}");
            var updated = request("PUT", "/users/" + id, withRole);
            assertEquals(200, updated.statusCode(), updated.body());
            assertTrue(updated.body().contains("\"roleCode\":\"STAFF\""));
            var preserved = request("PUT", "/users/" + id, body);
            assertEquals(200, preserved.statusCode());
            assertTrue(preserved.body().contains("\"roleCode\":\"STAFF\""));
            var invalid = request("PUT", "/users/" + id,
                    body.strip().replace("}", ",\"roleId\":999999}"));
            assertEquals(404, invalid.statusCode());
            assertEquals("STAFF", users.findById(id).orElseThrow().getRole().getCode());
        } finally {
            if (id != null) users.deleteById(id);
        }
    }

    @Test
    void createAcceptsExplicitRoleAndRejectsInvalidRolesWithoutSaving() throws Exception {
        long staffId = roles.findByCode("STAFF").orElseThrow().getId();
        String body = """
                {"fullName":"Explicit Role","email":"explicit-role@example.com","phone":"0965432109","roleId":%d}
                """;
        long before = users.count();
        assertEquals(404, request("POST", "/users", body.formatted(999999)).statusCode());
        assertEquals(400, request("POST", "/users", body.formatted(0)).statusCode());
        assertEquals(before, users.count());
        try {
            var created = request("POST", "/users", body.formatted(staffId));
            assertEquals(201, created.statusCode(), created.body());
            assertTrue(created.body().contains("\"roleCode\":\"STAFF\""));
            assertFalse(created.body().contains("passwordHash"));
        } finally {
            users.findAll().stream().filter(u -> "explicit-role@example.com".equals(u.getEmail()))
                    .forEach(users::delete);
        }
    }

    @Test
    void initializerBackfillsOldUsersAndDoesNotOverwriteAssignedRoles() {
        User legacy = new User();
        legacy.setFullName("Legacy user");
        legacy = users.save(legacy);
        Long id = legacy.getId();
        try {
            initializer.run();
            assertEquals("CUSTOMER", users.findById(id).orElseThrow().getRole().getCode());
            legacy = users.findById(id).orElseThrow();
            legacy.setRole(roles.findByCode("ADMIN").orElseThrow());
            users.save(legacy);
            initializer.run();
            assertEquals(4, roles.count());
            assertEquals("ADMIN", users.findById(id).orElseThrow().getRole().getCode());
        } finally {
            users.deleteById(id);
        }
    }
}
