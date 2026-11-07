package com.example.booking_nail;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.seed-data.enabled=true",
        "spring.datasource.url=jdbc:h2:mem:seeded_test;MODE=MySQL;DB_CLOSE_DELAY=-1"
})
class AdminApiIntegrationTests {
    @LocalServerPort
    private int port;
    private final HttpClient client = HttpClient.newHttpClient();
    private AuthenticatedApiClient api;

    @BeforeEach
    void signIn() throws Exception {
        api = AuthenticatedApiClient.admin(port);
    }

    private HttpResponse<String> request(String method, String path, String body) throws Exception {
        return api.request(method, path, body);
    }

    private long idFrom(String body) {
        var matcher = Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(body);
        assertTrue(matcher.find(), "API cần trả về id của bản ghi: " + body);
        return Long.parseLong(matcher.group(1));
    }

    @Test
    void seedDataIsAvailableThroughRealHttp() throws Exception {
        var users = request("GET", "/users", null);
        assertEquals(200, users.statusCode());
        assertTrue(users.body().contains("minhanh@example.com"));
        assertFalse(users.body().contains("passwordHash"));
        var services = request("GET", "/api/services", null);
        assertEquals(200, services.statusCode());
        var appointments = request("GET", "/api/appointments", null);
        assertEquals(200, appointments.statusCode());
        assertTrue(appointments.body().contains("APPT-SEED-001"));
        assertTrue(services.body().contains("Sơn gel"));
    }

    @Test
    void userCrudAndDuplicateValidationWorkThroughHttp() throws Exception {
        String body = """
                {"fullName":"Khách kiểm thử","email":"crud-test@example.com","phone":"0987654321"}
                """;
        var created = request("POST", "/users", body);
        assertEquals(201, created.statusCode(), created.body());
        long id = idFrom(created.body());
        assertEquals(409, request("POST", "/users", body).statusCode());
        assertEquals(200, request("GET", "/users/" + id, null).statusCode());
        var updated = request("PUT", "/users/" + id, body.replace("Khách kiểm thử", "Khách đã sửa"));
        assertEquals(200, updated.statusCode(), updated.body());
        assertTrue(updated.body().contains("Khách đã sửa"));
        assertEquals(204, request("DELETE", "/users/" + id, null).statusCode());
        assertEquals(404, request("GET", "/users/" + id, null).statusCode());
    }

    @Test
    void nailServiceCrudUsesRealCategoryId() throws Exception {
        long categoryId = idFrom(request("GET", "/api/categories", null).body());
        String body = """
                {"name":"Dịch vụ kiểm thử","categoryId":%d,"price":180000,"durationMinutes":45,"description":"Mẫu test","status":"ACTIVE"}
                """.formatted(categoryId);
        var created = request("POST", "/api/services", body);
        assertEquals(201, created.statusCode(), created.body());
        long id = idFrom(created.body());
        var updated = request("PUT", "/api/services/" + id, body.replace("180000", "200000"));
        assertEquals(200, updated.statusCode(), updated.body());
        assertTrue(updated.body().contains("200000"));
        assertEquals(204, request("DELETE", "/api/services/" + id, null).statusCode());
        assertEquals(404, request("GET", "/api/services/" + id, null).statusCode());
    }

    @Test
    void nextJsOriginCanUsePutAndDelete() throws Exception {
        for (String path : new String[]{"/users/1", "/api/services/1"}) {
            for (String method : new String[]{"PUT", "DELETE"}) {
                var preflight = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", method)
                        .header("Access-Control-Request-Headers", "content-type")
                        .method("OPTIONS", HttpRequest.BodyPublishers.noBody()).build();
                var response = client.send(preflight, HttpResponse.BodyHandlers.ofString());
                assertEquals(200, response.statusCode());
                assertEquals("http://localhost:3000", response.headers().firstValue("Access-Control-Allow-Origin").orElse(""));
            }
        }
    }

    @Test
    void productCrudThroughHttp() throws Exception {
        long categoryId = idFrom(request("GET", "/api/categories", null).body());
        String body = """
                {"name":"Dầu dưỡng móng","sku":"SKU-TEST-01","categoryId":%d,"costPrice":50000,"salePrice":90000,"stockQuantity":25,"minStock":5,"isForSale":true,"unit":"Lọ","status":"ACTIVE"}
                """.formatted(categoryId);
        var created = request("POST", "/api/products", body);
        assertEquals(201, created.statusCode(), created.body());
        long id = idFrom(created.body());

        assertEquals(409, request("POST", "/api/products", body).statusCode());

        var fetched = request("GET", "/api/products/" + id, null);
        assertEquals(200, fetched.statusCode());
        assertTrue(fetched.body().contains("SKU-TEST-01"));

        var updated = request("PUT", "/api/products/" + id, body.replace("90000", "110000"));
        assertEquals(200, updated.statusCode(), updated.body());
        assertTrue(updated.body().contains("110000"));

        assertEquals(204, request("DELETE", "/api/products/" + id, null).statusCode());
        assertEquals(404, request("GET", "/api/products/" + id, null).statusCode());
    }

    @Test
    void appointmentApiThroughHttp() throws Exception {
        long serviceId = idFrom(request("GET", "/api/services", null).body());
        long staffId = idFrom(request("GET", "/api/staff", null).body());
        String futureDate = LocalDate.now().plusDays(10).toString();
        String body = """
                {
                    "bookingCode": "APPT-DEMO-01",
                    "customerName": "Khách Demo",
                    "customerPhone": "0912345678",
                    "staffId": %d,
                    "serviceIds": [%d],
                    "appointmentDate": "%s",
                    "timeStart": "10:00:00",
                    "note": "Demo booking from customer"
                }
                """.formatted(staffId, serviceId, futureDate);
        var created = request("POST", "/api/appointments", body);
        assertEquals(201, created.statusCode(), created.body());
        long id = idFrom(created.body());

        var list = request("GET", "/api/appointments", null);
        assertEquals(200, list.statusCode());
        assertTrue(list.body().contains("APPT-DEMO-01"));

        var single = request("GET", "/api/appointments/" + id, null);
        assertEquals(200, single.statusCode());
        assertTrue(single.body().contains("APPT-DEMO-01"));

        assertEquals(200, request("PATCH", "/api/appointments/" + id + "/status", "{\"status\":\"CONFIRMED\"}").statusCode());
        assertEquals(200, request("PATCH", "/api/appointments/" + id + "/status", "{\"status\":\"CHECKED_IN\"}").statusCode());
        assertEquals(200, request("PATCH", "/api/appointments/" + id + "/status", "{\"status\":\"IN_SERVICE\"}").statusCode());

        String patchBody = """
                {"status":"COMPLETED","note":"Customer finished appointment","changedBy":%d}
                """.formatted(staffId);
        var patched = request("PATCH", "/api/appointments/" + id + "/status", patchBody);
        assertEquals(200, patched.statusCode(), patched.body());
        assertTrue(patched.body().contains("COMPLETED"));
        assertTrue(patched.body().contains("Customer finished appointment"));
    }

    @Test
    void categoryTypeFilterWorksThroughHttp() throws Exception {
        String prodCat = """
                {"name":"Dụng cụ vẽ móng","type":"PRODUCT","description":"Cọ vẽ, khuôn, nhũ"}
                """;
        var created = request("POST", "/api/categories", prodCat);
        assertEquals(201, created.statusCode());

        var prodCategories = request("GET", "/api/categories?type=PRODUCT", null);
        assertEquals(200, prodCategories.statusCode());
        assertTrue(prodCategories.body().contains("Dụng cụ vẽ móng"));

        var serviceCategories = request("GET", "/api/categories?type=SERVICE", null);
        assertEquals(200, serviceCategories.statusCode());
        assertFalse(serviceCategories.body().contains("Dụng cụ vẽ móng"));
    }
}
