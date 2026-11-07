package com.example.booking_nail.service;

import com.example.booking_nail.entity.User;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DualSessionService {

    public static final String ADMIN_COOKIE = "ADMIN_SESSION";
    public static final String CUSTOMER_COOKIE = "CUSTOMER_SESSION";

    private static final String HMAC_ALGO = "HmacSHA256";
    private static final byte[] SECRET_KEY_BYTES = "vela_nail_salon_dual_session_secret_key_2026_salt_secure_hmac".getBytes(StandardCharsets.UTF_8);

    public record SessionData(
            Long userId,
            String email,
            String roleCode,
            String passwordHash,
            LocalDateTime expiresAt
    ) {
        public boolean isExpired() {
            return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
        }
    }

    private final Map<String, SessionData> legacySessions = new ConcurrentHashMap<>();
    private final Set<String> revokedTokens = ConcurrentHashMap.newKeySet();

    public String createSession(User user) {
        if (user == null || user.getId() == null) {
            return null;
        }

        String roleCode = user.getRole() != null && user.getRole().getCode() != null
                ? user.getRole().getCode().toUpperCase()
                : "CUSTOMER";

        long expiresAtEpoch = Instant.now().plusSeconds(7L * 24 * 3600).getEpochSecond();
        String passHash = user.getPasswordHash() != null ? user.getPasswordHash() : "";
        String encodedPass = Base64.getUrlEncoder().withoutPadding().encodeToString(passHash.getBytes(StandardCharsets.UTF_8));

        String payload = user.getId() + ":" + roleCode + ":" + expiresAtEpoch + ":" + encodedPass;
        String signature = sign(payload);
        if (signature == null) {
            // Fallback to legacy UUID if signing fails
            String token = UUID.randomUUID().toString();
            legacySessions.put(token, new SessionData(
                    user.getId(),
                    user.getEmail(),
                    roleCode,
                    user.getPasswordHash(),
                    LocalDateTime.now().plusDays(7)
            ));
            return token;
        }

        return payload + "." + signature;
    }

    public SessionData getSession(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }

        String trimmed = token.strip();
        if (revokedTokens.contains(trimmed)) {
            return null;
        }

        if (trimmed.contains(".")) {
            int dotIdx = trimmed.lastIndexOf('.');
            String payload = trimmed.substring(0, dotIdx);
            String sig = trimmed.substring(dotIdx + 1);

            String expectedSig = sign(payload);
            if (expectedSig == null || !MessageDigest.isEqual(sig.getBytes(StandardCharsets.UTF_8), expectedSig.getBytes(StandardCharsets.UTF_8))) {
                return null;
            }

            try {
                String[] parts = payload.split(":", 4);
                if (parts.length < 4) {
                    return null;
                }
                Long userId = Long.parseLong(parts[0]);
                String roleCode = parts[1];
                long expiresAtEpoch = Long.parseLong(parts[2]);
                if (Instant.now().getEpochSecond() > expiresAtEpoch) {
                    return null;
                }
                String passwordHash = new String(Base64.getUrlDecoder().decode(parts[3]), StandardCharsets.UTF_8);
                LocalDateTime expiresAt = LocalDateTime.ofInstant(Instant.ofEpochSecond(expiresAtEpoch), ZoneId.systemDefault());

                return new SessionData(userId, null, roleCode, passwordHash, expiresAt);
            } catch (Exception ex) {
                return null;
            }
        }

        SessionData data = legacySessions.get(trimmed);
        if (data != null && data.isExpired()) {
            legacySessions.remove(trimmed);
            return null;
        }
        return data;
    }

    public void removeSession(String token) {
        if (token != null && !token.isBlank()) {
            String trimmed = token.strip();
            revokedTokens.add(trimmed);
            legacySessions.remove(trimmed);
        }
    }

    private static String sign(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(new SecretKeySpec(SECRET_KEY_BYTES, HMAC_ALGO));
            byte[] rawHmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            return null;
        }
    }
}
