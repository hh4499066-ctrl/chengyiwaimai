package com.chengyiwaimai.security;

import com.chengyiwaimai.common.BizException;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

public final class PasswordUtil {
    private static final String PREFIX = "pbkdf2_sha256";
    private static final int DEFAULT_ITERATIONS = 120_000;
    private static final int KEY_BITS = 256;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordUtil() {
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        if (rawPassword == null || rawPassword.isBlank() || encodedPassword == null || encodedPassword.isBlank()) {
            return false;
        }
        String[] parts = encodedPassword.split("\\$");
        if (parts.length != 4 || !PREFIX.equals(parts[0])) {
            return false;
        }
        try {
            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            byte[] expected = Base64.getDecoder().decode(parts[3]);
            byte[] actual = pbkdf2(rawPassword.toCharArray(), salt, iterations);
            return MessageDigest.isEqual(expected, actual);
        } catch (RuntimeException ex) {
            return false;
        }
    }

    public static String encode(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new BizException(400, "密码不能为空");
        }
        byte[] salt = new byte[16];
        RANDOM.nextBytes(salt);
        byte[] hash = pbkdf2(rawPassword.toCharArray(), salt, DEFAULT_ITERATIONS);
        return PREFIX + "$" + DEFAULT_ITERATIONS + "$"
                + Base64.getEncoder().encodeToString(salt) + "$"
                + Base64.getEncoder().encodeToString(hash);
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iterations) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, KEY_BITS);
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } catch (Exception ex) {
            throw new IllegalStateException("Password hashing failed", ex);
        }
    }
}
