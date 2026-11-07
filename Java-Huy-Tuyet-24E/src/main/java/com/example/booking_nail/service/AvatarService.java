package com.example.booking_nail.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class AvatarService {
    public static final long MAX_BYTES = 2L * 1024 * 1024;
    public static final int MAX_DIMENSION = 4096;
    public static final int TARGET_MAX_SIDE = 512;
    private static final String URL_PREFIX = "/api/avatars/";
    private static final Pattern MANAGED_FILENAME = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.png$"
    );

    private final Path directory;

    public AvatarService(@Value("${app.upload.avatar-dir:./uploads/avatars}") String dir) {
        this.directory = Path.of(dir).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn file ảnh đại diện");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Ảnh đại diện không được quá 2 MB");
        }

        String contentType = file.getContentType() != null
                ? file.getContentType().strip().toLowerCase(Locale.ROOT)
                : "";
        if (!contentType.equals("image/png") && !contentType.equals("image/jpeg") && !contentType.equals("image/webp")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ hỗ trợ định dạng ảnh PNG, JPEG hoặc WEBP");
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể đọc dữ liệu file tải lên");
        }

        if (bytes.length == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File ảnh rỗng");
        }
        if (bytes.length > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Ảnh đại diện không được quá 2 MB");
        }

        if (contentType.equals("image/png") && !isPngBytes(bytes)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung file không đúng định dạng PNG");
        }
        if (contentType.equals("image/jpeg") && !isJpegBytes(bytes)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung file không đúng định dạng JPEG");
        }

        BufferedImage decoded;
        try {
            decoded = ImageIO.read(new ByteArrayInputStream(bytes));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File tải lên không phải là ảnh hợp lệ");
        }

        if (decoded == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File tải lên không phải là ảnh hợp lệ");
        }

        int width = decoded.getWidth();
        int height = decoded.getHeight();
        if (width <= 0 || height <= 0 || width > MAX_DIMENSION || height > MAX_DIMENSION) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Kích thước ảnh không hợp lệ (tối đa " + MAX_DIMENSION + "x" + MAX_DIMENSION + " px)");
        }

        int squareSide = Math.min(width, height);
        int cropX = (width - squareSide) / 2;
        int cropY = (height - squareSide) / 2;
        BufferedImage cropped = decoded.getSubimage(cropX, cropY, squareSide, squareSide);

        int outSide = Math.min(squareSide, TARGET_MAX_SIDE);
        BufferedImage normalized = new BufferedImage(outSide, outSide, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = normalized.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g2d.drawImage(cropped, 0, 0, outSide, outSide, null);
        g2d.dispose();

        try {
            Files.createDirectories(directory);
            String filename = UUID.randomUUID() + ".png";
            Path target = directory.resolve(filename).normalize();
            if (!target.startsWith(directory)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn lưu file không hợp lệ");
            }
            if (!ImageIO.write(normalized, "png", target.toFile())) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể mã hóa ảnh PNG");
            }

            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCompletion(int status) {
                        if (status == STATUS_ROLLED_BACK) {
                            try {
                                Files.deleteIfExists(target);
                            } catch (IOException ignored) {}
                        }
                    }
                });
            }

            return URL_PREFIX + filename;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu file ảnh");
        }
    }

    public Resource read(String filename) {
        if (filename == null || !MANAGED_FILENAME.matcher(filename).matches()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh đại diện");
        }
        Path target = directory.resolve(filename).normalize();
        if (!target.startsWith(directory) || !Files.exists(target)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh đại diện");
        }
        return new FileSystemResource(target);
    }

    public void deleteAfterCommit(String url) {
        if (!isManagedUrl(url)) {
            return;
        }
        String filename = url.substring(URL_PREFIX.length());
        if (!MANAGED_FILENAME.matcher(filename).matches()) {
            return;
        }
        Path target = directory.resolve(filename).normalize();
        if (!target.startsWith(directory)) {
            return;
        }

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    try {
                        Files.deleteIfExists(target);
                    } catch (IOException ignored) {}
                }
            });
        } else {
            try {
                Files.deleteIfExists(target);
            } catch (IOException ignored) {}
        }
    }

    public static boolean isManagedUrl(String url) {
        if (url == null || !url.startsWith(URL_PREFIX)) {
            return false;
        }
        String filename = url.substring(URL_PREFIX.length());
        return MANAGED_FILENAME.matcher(filename).matches();
    }

    private static boolean isPngBytes(byte[] b) {
        return b.length >= 8
                && (b[0] & 0xFF) == 0x89
                && (b[1] & 0xFF) == 0x50
                && (b[2] & 0xFF) == 0x4E
                && (b[3] & 0xFF) == 0x47
                && (b[4] & 0xFF) == 0x0D
                && (b[5] & 0xFF) == 0x0A
                && (b[6] & 0xFF) == 0x1A
                && (b[7] & 0xFF) == 0x0A;
    }

    private static boolean isJpegBytes(byte[] b) {
        return b.length >= 3
                && (b[0] & 0xFF) == 0xFF
                && (b[1] & 0xFF) == 0xD8
                && (b[2] & 0xFF) == 0xFF;
    }
}
