package com.chengyiwaimai.security;

import com.chengyiwaimai.common.BizException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String DEMO_SECRET = "chengyi-waimai-local-demo-secret-2026-change-in-prod";

    private final SecretKey key;
    private final long accessTokenMillis;

    public JwtUtil(@Value("${chengyi.jwt-secret}") String secret,
                   @Value("${chengyi.jwt-access-token-minutes:120}") long accessTokenMinutes,
                   @Value("${chengyi.require-secure-secrets:false}") boolean requireSecureSecrets) {
        if (secret == null || secret.isBlank() || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be configured and contain at least 32 bytes");
        }
        if (requireSecureSecrets && DEMO_SECRET.equals(secret)) {
            throw new IllegalStateException("JWT_SECRET must be configured with a non-demo value when REQUIRE_SECURE_SECRETS=true");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenMillis = Math.max(5, accessTokenMinutes) * 60_000L;
    }

    public String createToken(Long userId, String phone, String role) {
        return Jwts.builder()
                .subject(phone)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenMillis))
                .signWith(key)
                .compact();
    }

    public CurrentUser parseToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Object userIdClaim = claims.get("userId");
            Long userId = userIdClaim instanceof Number number ? number.longValue() : Long.valueOf(String.valueOf(userIdClaim));
            String role = claims.get("role", String.class);
            return new CurrentUser(userId, claims.getSubject(), role);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BizException(401, "未登录或登录已过期");
        }
    }
}
