package com.example.booking_nail;

import java.io.ByteArrayOutputStream;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthenticatedApiClient {
    final CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
    private final HttpClient client = HttpClient.newBuilder().cookieHandler(cookies).build();
    private final String baseUrl;

    AuthenticatedApiClient(int port) {
        baseUrl = "http://localhost:" + port;
    }

    static AuthenticatedApiClient admin(int port) throws Exception {
        var api = new AuthenticatedApiClient(port);
        assertEquals(200, api.login("integration-admin@example.com", "IntegrationLogin!2026").statusCode());
        return api;
    }

    HttpResponse<String> login(String email, String password) throws Exception {
        return request("POST", "/api/auth/login", "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
    }

    HttpResponse<String> request(String method, String path, String body) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create(baseUrl + path)).header("Content-Type", "application/json");
        builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body));
        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }

    static String field(String body, String name) {
        var matcher = Pattern.compile("\"" + name + "\"\\s*:\\s*\"([^\"]*)\"").matcher(body);
        if (!matcher.find()) throw new AssertionError("Missing " + name + " in HTTP response: " + body);
        return matcher.group(1);
    }

    HttpResponse<String> uploadUser(String method, String path, String userJson, byte[] avatar,
                                    String type, String filename) throws Exception {
        String boundary = "AvatarTest" + UUID.randomUUID();
        var bytes = new ByteArrayOutputStream();
        bytes.write(("--" + boundary + "\r\nContent-Disposition: form-data; name=\"user\"\r\nContent-Type: application/json\r\n\r\n"
                + userJson + "\r\n--" + boundary + "\r\nContent-Disposition: form-data; name=\"avatar\"; filename=\""
                + filename + "\"\r\nContent-Type: " + type + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
        bytes.write(avatar);
        bytes.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
        var builder = HttpRequest.newBuilder(URI.create(baseUrl + path))
                .header("Content-Type", "multipart/form-data; boundary=" + boundary);
        return client.send(builder.method(method, HttpRequest.BodyPublishers.ofByteArray(bytes.toByteArray())).build(),
                HttpResponse.BodyHandlers.ofString());
    }

    HttpResponse<byte[]> image(String path) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create(baseUrl + path)).GET().build(), HttpResponse.BodyHandlers.ofByteArray());
    }
}
