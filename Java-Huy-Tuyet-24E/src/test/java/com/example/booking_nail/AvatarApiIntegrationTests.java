package com.example.booking_nail;

import com.example.booking_nail.repository.UserRepository;
import com.example.booking_nail.service.AvatarService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AvatarApiIntegrationTests {
    private static final Path DIRECTORY;
    static {
        try { DIRECTORY = Files.createTempDirectory("booking-avatar-tests-"); }
        catch (IOException exception) { throw new ExceptionInInitializerError(exception); }
    }
    @DynamicPropertySource
    static void storage(DynamicPropertyRegistry registry) {
        registry.add("app.upload.avatar-dir", DIRECTORY::toString);
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:avatar_upload_tests;MODE=MySQL;DB_CLOSE_DELAY=-1");
    }

    @LocalServerPort private int port;
    @Autowired private UserRepository users;
    @Autowired private AvatarService avatarService;
    @Autowired private PlatformTransactionManager transactions;
    private AuthenticatedApiClient admin;
    private final List<Long> createdIds = new ArrayList<>();

    @BeforeEach
    void signIn() throws Exception { admin = AuthenticatedApiClient.admin(port); }

    @AfterEach
    void cleanup() throws Exception {
        for (Long id : createdIds) {
            var response = admin.request("DELETE", "/users/" + id, null);
            assertTrue(response.statusCode() == 204 || response.statusCode() == 404, response.body());
        }
        try (var files = Files.list(DIRECTORY)) { assertEquals(0, files.count(), "Avatar files should be cleaned up"); }
    }

    @AfterAll
    static void removeEmptyTestDirectory() throws IOException { Files.delete(DIRECTORY); }

    private String userJson(String email, String extra) {
        return "{\"fullName\":\"Avatar Test\",\"email\":\"" + email + "\",\"phone\":null" + extra + "}";
    }

    private long remember(String email) {
        long id = users.findByEmailIgnoreCase(email).orElseThrow().getId();
        createdIds.add(id);
        return id;
    }

    private byte[] png(int width, int height) throws IOException {
        var image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        var graphics = image.createGraphics();
        graphics.setColor(new Color(198, 168, 117));
        graphics.fillRect(0, 0, width, height);
        graphics.dispose();
        var output = new ByteArrayOutputStream();
        assertTrue(ImageIO.write(image, "png", output));
        return output.toByteArray();
    }

    @Test
    void createsUserWithAvatarAndServesNormalizedAuthenticatedPng() throws Exception {
        String email = "avatar-create@example.com";
        var response = admin.uploadUser("POST", "/users", userJson(email, ""), png(900, 600), "image/png", "../../original-name.png");
        assertEquals(201, response.statusCode(), response.body());
        long id = remember(email);
        String url = AuthenticatedApiClient.field(response.body(), "avatarUrl");
        assertTrue(AvatarService.isManagedUrl(url));
        assertEquals(url, users.findById(id).orElseThrow().getAvatarUrl());
        var imageResponse = admin.image(url);
        assertEquals(200, imageResponse.statusCode());
        assertTrue(imageResponse.headers().firstValue("Content-Type").orElse("").startsWith("image/png"));
        var image = ImageIO.read(new ByteArrayInputStream(imageResponse.body()));
        assertEquals(512, image.getWidth());
        assertEquals(512, image.getHeight());
        assertEquals(401, new AuthenticatedApiClient(port).image(url).statusCode());
        try (var files = Files.list(DIRECTORY)) { assertEquals(1, files.count()); }
    }

    @Test
    void acceptsJpegAndConvertsItToPng() throws Exception {
        var source = ImageIO.read(new ByteArrayInputStream(png(80, 60)));
        var jpeg = new ByteArrayOutputStream();
        assertTrue(ImageIO.write(source, "jpeg", jpeg));
        String email = "avatar-jpeg@example.com";
        var response = admin.uploadUser("POST", "/users", userJson(email, ""), jpeg.toByteArray(), "image/jpeg", "photo.jpg");
        assertEquals(201, response.statusCode(), response.body());
        remember(email);
        var imageResponse = admin.image(AuthenticatedApiClient.field(response.body(), "avatarUrl"));
        assertEquals(200, imageResponse.statusCode());
        assertTrue(imageResponse.headers().firstValue("Content-Type").orElse("").startsWith("image/png"));
        var image = ImageIO.read(new ByteArrayInputStream(imageResponse.body()));
        assertEquals(60, image.getWidth());
        assertEquals(60, image.getHeight());
    }

    @Test
    void replacesAndRemovesAvatarWithoutLeavingOldFiles() throws Exception {
        String email = "avatar-replace@example.com";
        var created = admin.uploadUser("POST", "/users", userJson(email, ""), png(20, 30), "image/png", "first.png");
        assertEquals(201, created.statusCode(), created.body());
        long id = remember(email);
        String first = AuthenticatedApiClient.field(created.body(), "avatarUrl");
        var replaced = admin.uploadUser("PUT", "/users/" + id, userJson(email, ",\"avatarUrl\":\"" + first + "\""), png(40, 30), "image/png", "second.png");
        assertEquals(200, replaced.statusCode(), replaced.body());
        String second = AuthenticatedApiClient.field(replaced.body(), "avatarUrl");
        assertNotEquals(first, second);
        assertEquals(404, admin.image(first).statusCode());
        assertEquals(200, admin.image(second).statusCode());
        var removed = admin.request("PUT", "/users/" + id, userJson(email, ",\"avatarUrl\":\"\""));
        assertEquals(200, removed.statusCode(), removed.body());
        assertNull(users.findById(id).orElseThrow().getAvatarUrl());
        assertEquals(404, admin.image(second).statusCode());
    }

    @Test
    void deletingUserRemovesManagedAvatar() throws Exception {
        String email = "avatar-delete@example.com";
        var created = admin.uploadUser("POST", "/users", userJson(email, ""), png(20, 20), "image/png", "image.png");
        assertEquals(201, created.statusCode(), created.body());
        long id = remember(email);
        String url = AuthenticatedApiClient.field(created.body(), "avatarUrl");
        assertEquals(204, admin.request("DELETE", "/users/" + id, null).statusCode());
        assertEquals(404, admin.image(url).statusCode());
    }

    @Test
    void rejectsSpoofedEmptyOversizedAndHugeDimensionFilesWithoutCreatingUsers() throws Exception {
        long count = users.count();
        String body = userJson("avatar-invalid@example.com", "");
        assertEquals(400, admin.uploadUser("POST", "/users", body, "not-an-image".getBytes(), "image/png", "fake.png").statusCode());
        assertEquals(400, admin.uploadUser("POST", "/users", body, "<svg/>".getBytes(), "image/svg+xml", "avatar.svg").statusCode());
        assertEquals(400, admin.uploadUser("POST", "/users", body, png(10, 10), "image/jpeg", "mismatch.jpg").statusCode());
        assertEquals(400, admin.uploadUser("POST", "/users", body, new byte[0], "image/png", "empty.png").statusCode());
        assertEquals(413, admin.uploadUser("POST", "/users", body, new byte[(int) AvatarService.MAX_BYTES + 1], "image/png", "large.png").statusCode());
        assertEquals(400, admin.uploadUser("POST", "/users", body, png(4097, 1), "image/png", "wide.png").statusCode());
        assertEquals(count, users.count());
    }

    @Test
    void failedProfileValidationDoesNotChangeExistingAvatar() throws Exception {
        String email = "avatar-validation@example.com";
        var created = admin.uploadUser("POST", "/users", userJson(email, ""), png(20, 20), "image/png", "first.png");
        assertEquals(201, created.statusCode(), created.body());
        long id = remember(email);
        String first = AuthenticatedApiClient.field(created.body(), "avatarUrl");
        var invalid = admin.uploadUser("PUT", "/users/" + id, userJson(email, ",\"status\":\"INVALID\""), png(30, 30), "image/png", "new.png");
        assertEquals(400, invalid.statusCode());
        assertEquals(first, users.findById(id).orElseThrow().getAvatarUrl());
        assertEquals(200, admin.image(first).statusCode());
        try (var files = Files.list(DIRECTORY)) { assertEquals(1, files.count()); }
    }

    @Test
    void transactionRollbackDeletesNewFile() throws Exception {
        var template = new TransactionTemplate(transactions);
        byte[] image = png(30, 30);
        assertThrows(IllegalStateException.class, () -> template.execute(status -> {
            String url = avatarService.store(new MockMultipartFile("avatar", "image.png", "image/png", image));
            assertTrue(avatarService.read(url.substring("/api/avatars/".length())).exists());
            throw new IllegalStateException("Simulate a database rollback");
        }));
        try (var files = Files.list(DIRECTORY)) { assertEquals(0, files.count()); }
    }

    @Test
    void requiresAdminForMultipartAndRejectsInvalidReadPaths() throws Exception {
        byte[] image = png(20, 20);
        String body = userJson("avatar-access@example.com", "");
        assertEquals(401, new AuthenticatedApiClient(port).uploadUser("POST", "/users", body, image, "image/png", "avatar.png").statusCode());
        assertEquals(404, admin.image("/api/avatars/not-a-managed-file.png").statusCode());
        assertEquals(404, admin.image("/api/avatars/" + UUID.randomUUID() + ".png").statusCode());
    }
}
