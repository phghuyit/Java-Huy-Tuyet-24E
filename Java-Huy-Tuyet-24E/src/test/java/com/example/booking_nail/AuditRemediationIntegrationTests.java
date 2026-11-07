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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "app.seed-data.enabled=true",
        "spring.datasource.url=jdbc:h2:mem:audit_remediation_test;MODE=MySQL;DB_CLOSE_DELAY=-1"
})
class AuditRemediationIntegrationTests {

    @LocalServerPort
    private int port;

    private final HttpClient anonClient = HttpClient.newHttpClient();
    private AuthenticatedApiClient adminApi;

    @BeforeEach
    void setUp() throws Exception {
        adminApi = AuthenticatedApiClient.admin(port);
    }

    private HttpResponse<String> anonRequest(String method, String path, String body) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Content-Type", "application/json");
        if (body == null) {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            builder.method(method, HttpRequest.BodyPublishers.ofString(body));
        }
        return anonClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    private long extractId(String body) {
        var matcher = Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(body);
        assertTrue(matcher.find(), "Expected id in response: " + body);
        return Long.parseLong(matcher.group(1));
    }

    private String extractString(String body, String field) {
        var matcher = Pattern.compile("\"" + field + "\"\\s*:\\s*\"([^\"]+)\"").matcher(body);
        assertTrue(matcher.find(), "Expected field '" + field + "' in response: " + body);
        return matcher.group(1);
    }

    @Test
    void concurrentBookingsForSameStaffAndSlotAllowOnlyOneWinner() throws Exception {
        long staffId = extractId(adminApi.request("GET", "/api/staff", null).body());
        long serviceId = extractId(adminApi.request("GET", "/api/services", null).body());
        String date = LocalDate.now().plusDays(10).toString();

        int threads = 12;
        var pool = Executors.newFixedThreadPool(threads);
        var startGate = new CountDownLatch(1);
        List<Callable<HttpResponse<String>>> tasks = new ArrayList<>();

        for (int i = 0; i < threads; i++) {
            final int idx = i;
            tasks.add(() -> {
                startGate.await();
                String payload = """
                        {
                          "staffId": %d,
                          "customerName": "Khách đua lệnh %d",
                          "customerPhone": "09123456%02d",
                          "customerEmail": "race%d@example.com",
                          "appointmentDate": "%s",
                          "timeStart": "10:00:00",
                          "serviceIds": [%d]
                        }
                        """.formatted(staffId, idx, idx, idx, date, serviceId);
                return anonRequest("POST", "/api/appointments", payload);
            });
        }

        List<Future<HttpResponse<String>>> futures = new ArrayList<>();
        for (var task : tasks) {
            futures.add(pool.submit(task));
        }
        startGate.countDown();

        int createdCount = 0;
        int conflictCount = 0;
        for (var f : futures) {
            HttpResponse<String> res = f.get();
            if (res.statusCode() == 201) {
                createdCount++;
            } else if (res.statusCode() == 409) {
                conflictCount++;
            } else {
                fail("Unexpected status code: " + res.statusCode() + " body: " + res.body());
            }
        }
        pool.shutdown();

        assertEquals(1, createdCount, "Exactly 1 concurrent booking should succeed");
        assertEquals(threads - 1, conflictCount, "Remaining 11 concurrent bookings must be rejected with 409 Conflict");
    }

    @Test
    void anyTechnicianAutoAssignsAvailableStaffAndRejectsWhenAllBusy() throws Exception {
        long serviceId = extractId(adminApi.request("GET", "/api/services", null).body());
        String date = LocalDate.now().plusDays(11).toString();

        String staffBody = adminApi.request("GET", "/api/staff", null).body();
        var matcher = Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(staffBody);
        List<Long> staffIds = new ArrayList<>();
        while (matcher.find()) {
            staffIds.add(Long.parseLong(matcher.group(1)));
        }
        assertFalse(staffIds.isEmpty());

        for (int i = 0; i < staffIds.size(); i++) {
            String payload = """
                    {
                      "staffId": null,
                      "customerName": "Khách tự chọn nhân viên %d",
                      "customerPhone": "09223344%02d",
                      "appointmentDate": "%s",
                      "timeStart": "14:00:00",
                      "serviceIds": [%d]
                    }
                    """.formatted(i, i, date, serviceId);
            var res = anonRequest("POST", "/api/appointments", payload);
            assertEquals(201, res.statusCode(), res.body());
        }

        String overflowPayload = """
                {
                  "staffId": null,
                  "customerName": "Khách vượt quá số nhân viên",
                  "customerPhone": "0922334499",
                  "appointmentDate": "%s",
                  "timeStart": "14:00:00",
                  "serviceIds": [%d]
                }
                """.formatted(date, serviceId);
        var overflowRes = anonRequest("POST", "/api/appointments", overflowPayload);
        assertEquals(409, overflowRes.statusCode(), overflowRes.body());
    }

    @Test
    void lookupAndCancelRequireExactTenDigitPhoneVerification() throws Exception {
        long staffId = extractId(adminApi.request("GET", "/api/staff", null).body());
        long serviceId = extractId(adminApi.request("GET", "/api/services", null).body());
        String date = LocalDate.now().plusDays(12).toString();

        String createBody = """
                {
                  "staffId": %d,
                  "customerName": "Khách Tra Cứu",
                  "customerPhone": "0933445566",
                  "appointmentDate": "%s",
                  "timeStart": "09:00:00",
                  "serviceIds": [%d]
                }
                """.formatted(staffId, date, serviceId);
        var created = anonRequest("POST", "/api/appointments", createBody);
        assertEquals(201, created.statusCode(), created.body());
        String code = extractString(created.body(), "bookingCode");

        assertEquals(400, anonRequest("GET", "/api/appointments/lookup?code=" + code, null).statusCode());
        assertEquals(400, anonRequest("GET", "/api/appointments/lookup?code=" + code + "&phone=6", null).statusCode());
        assertEquals(404, anonRequest("GET", "/api/appointments/lookup?code=" + code + "&phone=0933445599", null).statusCode());
        assertEquals(200, anonRequest("GET", "/api/appointments/lookup?code=" + code + "&phone=0933445566", null).statusCode());

        assertEquals(400, anonRequest("POST", "/api/appointments/lookup/cancel",
                "{\"bookingCode\":\"%s\",\"reason\":\"Hủy không SĐT\"}".formatted(code)).statusCode());
        var cancelled = anonRequest("POST", "/api/appointments/lookup/cancel",
                "{\"bookingCode\":\"%s\",\"phone\":\"0933445566\",\"reason\":\"Đổi ý\"}".formatted(code));
        assertEquals(200, cancelled.statusCode(), cancelled.body());
        assertTrue(cancelled.body().contains("\"CANCELLED\""));
    }

    @Test
    void paymentWorksOnCompletedAppointmentAndRejectsInvalidPaymentValues() throws Exception {
        long staffId = extractId(adminApi.request("GET", "/api/staff", null).body());
        long serviceId = extractId(adminApi.request("GET", "/api/services", null).body());
        String date = LocalDate.now().plusDays(13).toString();

        var created = adminApi.request("POST", "/api/appointments", """
                {
                  "staffId": %d,
                  "customerName": "Khách Thanh Toán",
                  "customerPhone": "0944556677",
                  "appointmentDate": "%s",
                  "timeStart": "11:00:00",
                  "serviceIds": [%d]
                }
                """.formatted(staffId, date, serviceId));
        assertEquals(201, created.statusCode(), created.body());
        long apptId = extractId(created.body());

        assertEquals(200, adminApi.request("PATCH", "/api/appointments/" + apptId + "/status", "{\"status\":\"CONFIRMED\"}").statusCode());
        assertEquals(200, adminApi.request("PATCH", "/api/appointments/" + apptId + "/status", "{\"status\":\"CHECKED_IN\"}").statusCode());
        assertEquals(200, adminApi.request("PATCH", "/api/appointments/" + apptId + "/status", "{\"status\":\"IN_SERVICE\"}").statusCode());
        assertEquals(200, adminApi.request("PATCH", "/api/appointments/" + apptId + "/status", "{\"status\":\"COMPLETED\"}").statusCode());

        assertEquals(400, adminApi.request("PATCH", "/api/appointments/" + apptId + "/payment",
                "{\"paymentStatus\":\"PAID\",\"paymentMethod\":\"transfer\",\"amountPaid\":-1000}").statusCode());
        assertEquals(400, adminApi.request("PATCH", "/api/appointments/" + apptId + "/payment",
                "{\"paymentStatus\":\"BANANA\",\"paymentMethod\":\"transfer\",\"amountPaid\":10000}").statusCode());
        assertEquals(400, adminApi.request("PATCH", "/api/appointments/" + apptId + "/payment",
                "{\"paymentStatus\":\"PAID\",\"paymentMethod\":\"INVALID\",\"amountPaid\":10000}").statusCode());

        var paid = adminApi.request("PATCH", "/api/appointments/" + apptId + "/payment",
                "{\"paymentStatus\":\"PAID\",\"paymentMethod\":\"transfer\",\"amountPaid\":150000}");
        assertEquals(200, paid.statusCode(), paid.body());
        assertTrue(paid.body().contains("\"PAID\""));
    }

    @Test
    void appointmentScheduleValidationAndInvalidStaffOrServiceChecks() throws Exception {
        long staffId = extractId(adminApi.request("GET", "/api/staff", null).body());
        long serviceId = extractId(adminApi.request("GET", "/api/services", null).body());
        String date = LocalDate.now().plusDays(14).toString();

        assertEquals(400, anonRequest("POST", "/api/appointments", """
                {
                  "staffId": %d,
                  "appointmentDate": "%s",
                  "timeStart": "08:00:00",
                  "serviceIds": [%d]
                }
                """.formatted(staffId, date, serviceId)).statusCode());

        assertEquals(400, anonRequest("POST", "/api/appointments", """
                {
                  "staffId": 999999,
                  "customerName": "Khách Test",
                  "customerPhone": "0955667788",
                  "appointmentDate": "%s",
                  "timeStart": "08:00:00",
                  "serviceIds": [%d]
                }
                """.formatted(date, serviceId)).statusCode());

        assertEquals(400, anonRequest("POST", "/api/appointments", """
                {
                  "staffId": %d,
                  "customerName": "Khách Test",
                  "customerPhone": "0955667788",
                  "appointmentDate": "%s",
                  "timeStart": "23:30:00",
                  "serviceIds": [%d]
                }
                """.formatted(staffId, date, serviceId)).statusCode());

        var created = anonRequest("POST", "/api/appointments", """
                {
                  "staffId": %d,
                  "customerName": "Khách Sáng Sớm",
                  "customerPhone": "0955667788",
                  "appointmentDate": "%s",
                  "timeStart": "07:30:00",
                  "serviceIds": [%d]
                }
                """.formatted(staffId, date, serviceId));
        assertEquals(201, created.statusCode(), created.body());
        long apptId = extractId(created.body());

        assertEquals(400, adminApi.request("PUT", "/api/appointments/" + apptId, """
                {"appointmentDate": "2020-01-01", "startTime": "10:00"}
                """).statusCode());

        var updated = adminApi.request("PUT", "/api/appointments/" + apptId, """
                {"appointmentDate": "%s", "startTime": "15:00"}
                """.formatted(date));
        assertEquals(200, updated.statusCode(), updated.body());
        assertTrue(updated.body().contains("\"15:00:00\""));
        assertFalse(updated.body().contains("\"timeEnd\":\"08:"));
    }

    @Test
    void stockMovementRejectsOutExceedingAvailableQuantity() throws Exception {
        var createdProduct = adminApi.request("POST", "/api/products", """
                {"name":"Sơn Thử Tồn Kho","sku":"SKU-STOCK-AUDIT","unit":"Chai","stockQuantity":5,"minStock":1,"costPrice":50000,"salePrice":90000}
                """);
        assertEquals(201, createdProduct.statusCode(), createdProduct.body());
        long productId = extractId(createdProduct.body());

        var outExceed = adminApi.request("POST", "/api/stocks", """
                {"productId":%d,"type":"OUT","delta":-10,"note":"Xuất quá tồn kho"}
                """.formatted(productId));
        assertEquals(409, outExceed.statusCode(), outExceed.body());

        var productAfter = adminApi.request("GET", "/api/products/" + productId, null);
        assertEquals(200, productAfter.statusCode());
        assertTrue(productAfter.body().contains("\"stockQuantity\":5"));
    }

    @Test
    void passwordResetEndToEndUpdatesDatabasePassword() throws Exception {
        var reg = anonRequest("POST", "/api/auth/client/register", """
                {"fullName":"Khách Quên Mật Khẩu","email":"forgot-audit@example.com","phone":"0966778899","password":"OldPassword123"}
                """);
        assertEquals(201, reg.statusCode(), reg.body());

        var forgot = anonRequest("POST", "/api/auth/forgot-password", """
                {"email":"forgot-audit@example.com","scope":"customer"}
                """);
        assertEquals(200, forgot.statusCode(), forgot.body());
        String token = extractString(forgot.body(), "token");

        var verify = anonRequest("GET", "/api/auth/reset-password/verify?token=" + token + "&scope=customer", null);
        assertEquals(200, verify.statusCode(), verify.body());

        var reset = anonRequest("POST", "/api/auth/reset-password", """
                {"token":"%s","email":"forgot-audit@example.com","password":"NewPassword456"}
                """.formatted(token));
        assertEquals(200, reset.statusCode(), reset.body());

        var oldLogin = anonRequest("POST", "/api/auth/client/login", """
                {"email":"forgot-audit@example.com","password":"OldPassword123"}
                """);
        assertEquals(401, oldLogin.statusCode());

        var newLogin = anonRequest("POST", "/api/auth/client/login", """
                {"email":"forgot-audit@example.com","password":"NewPassword456"}
                """);
        assertEquals(200, newLogin.statusCode(), newLogin.body());
    }
}
