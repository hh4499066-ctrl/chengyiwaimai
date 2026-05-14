package com.chengyiwaimai.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class SensitiveDataCrypto {
    private static final String PREFIX = "enc:v1:";
    private static final String DEMO_SECRET = "chengyi-waimai-local-demo-secret-2026-change-in-prod";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_BYTES = 12;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final SecretKeySpec key;

    public SensitiveDataCrypto(@Value("${chengyi.data-encryption-key}") String secret,
                               @Value("${chengyi.require-secure-secrets:false}") boolean requireSecureSecrets) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("DATA_ENCRYPTION_KEY or JWT_SECRET must be configured");
        }
        if (requireSecureSecrets && DEMO_SECRET.equals(secret)) {
            throw new IllegalStateException("DATA_ENCRYPTION_KEY must be configured with a non-demo value when REQUIRE_SECURE_SECRETS=true");
        }
        this.key = new SecretKeySpec(sha256(secret), "AES");
    }

    public String encrypt(String plaintext) {
        if (plaintext == null || plaintext.isBlank() || plaintext.startsWith(PREFIX)) {
            return plaintext;
        }
        try {
            byte[] iv = new byte[IV_BYTES];
            RANDOM.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return PREFIX + Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(ciphertext);
        } catch (Exception ex) {
            throw new IllegalStateException("Sensitive data encryption failed", ex);
        }
    }

    public String decrypt(String storedValue) {
        if (storedValue == null || storedValue.isBlank() || !storedValue.startsWith(PREFIX)) {
            return storedValue;
        }
        try {
            String payload = storedValue.substring(PREFIX.length());
            int separator = payload.indexOf(':');
            byte[] iv = Base64.getDecoder().decode(payload.substring(0, separator));
            byte[] ciphertext = Base64.getDecoder().decode(payload.substring(separator + 1));
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_BITS, iv));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            return "";
        }
    }

    private byte[] sha256(String secret) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new IllegalStateException("Sensitive data key initialization failed", ex);
        }
    }
}
