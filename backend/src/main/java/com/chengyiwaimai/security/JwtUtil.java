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
    private final SecretKey key;

    public JwtUtil(@Value("${chengyi.jwt-secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(Long userId, String phone, String role) {
        return Jwts.builder()
                .subject(phone)
                .claim("userId", userId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 7L * 24 * 3600 * 1000))
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
