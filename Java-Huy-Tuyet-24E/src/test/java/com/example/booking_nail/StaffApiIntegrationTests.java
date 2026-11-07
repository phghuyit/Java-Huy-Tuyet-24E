package com.example.booking_nail;

import com.example.booking_nail.entity.Role;
import com.example.booking_nail.entity.User;
import com.example.booking_nail.repository.RoleRepository;
import com.example.booking_nail.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class StaffApiIntegrationTests {
    @LocalServerPort
    private int port;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private UserRepository userRepository;
    private AuthenticatedApiClient api;

    @BeforeEach
    void signIn() throws Exception {
        api = AuthenticatedApiClient.admin(port);
    }

    private HttpResponse<String> request(String method, String path, String body) throws Exception {
        return api.request(method, path, body);
    }

    @Test
    void testStaffEndpointsCrud() throws Exception {
        var listResponse = request("GET", "/api/staff", null);
        assertEquals(200, listResponse.statusCode());
        assertTrue(listResponse.body().startsWith("["));

        String createJson = """
                {
                    "name": "Thợ Làm Móng Test",
                    "role": "Senior Nail Artist",
                    "email": "staff.test.api@gmail.com",
                    "phone": "0909999888",
                    "bio": "5 năm kinh nghiệm",
                    "experienceYears": 5,
                    "status": "ACTIVE"
                }
                """;
        var createResponse = request("POST", "/api/staff", createJson);
        assertEquals(201, createResponse.statusCode());
        assertTrue(createResponse.body().contains("Thợ Làm Móng Test"));
        assertTrue(createResponse.body().contains("\"roleCode\":\"STAFF\""));
        assertTrue(createResponse.body().contains("\"role\":\"Senior Nail Artist\""));

        User createdUser = userRepository.findByEmailIgnoreCase("staff.test.api@gmail.com").orElseThrow();
        String updateJson = """
                {
                    "name": "Thợ Làm Móng Test Đã Sửa",
                    "role": "Master Nail Artist",
                    "email": "staff.test.api@gmail.com",
                    "phone": "0909999888",
                    "bio": "6 năm kinh nghiệm",
                    "experienceYears": 6,
                    "status": "ACTIVE"
                }
                """;
        var updateResponse = request("PUT", "/api/staff/" + createdUser.getId(), updateJson);
        assertEquals(200, updateResponse.statusCode());
        assertTrue(updateResponse.body().contains("Thợ Làm Móng Test Đã Sửa"));
        assertTrue(updateResponse.body().contains("\"role\":\"Master Nail Artist\""));

        var getResponse = request("GET", "/api/staff/" + createdUser.getId(), null);
        assertEquals(200, getResponse.statusCode());
        assertTrue(getResponse.body().contains("Thợ Làm Móng Test Đã Sửa"));
        assertTrue(getResponse.body().contains("\"role\":\"Master Nail Artist\""));
        assertTrue(getResponse.body().contains("\"experienceYears\":6"));

        var deleteResponse = request("DELETE", "/api/staff/" + createdUser.getId(), null);
        assertEquals(204, deleteResponse.statusCode());
        assertFalse(userRepository.existsById(createdUser.getId()));
    }
}
