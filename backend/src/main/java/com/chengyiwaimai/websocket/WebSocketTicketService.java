package com.chengyiwaimai.websocket;

import com.chengyiwaimai.security.CurrentUser;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebSocketTicketService {
    private static final Duration TICKET_TTL = Duration.ofSeconds(60);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final StringRedisTemplate stringRedisTemplate;
    private final Map<String, Ticket> fallbackTickets = new ConcurrentHashMap<>();

    public WebSocketTicketService(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }

    public String createTicket(CurrentUser user, String orderId) {
        byte[] random = new byte[32];
        RANDOM.nextBytes(random);
        String ticket = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        String payload = user.userId() + "|" + user.phone() + "|" + user.role() + "|" + orderId;
        try {
            stringRedisTemplate.opsForValue().set(ticketKey(ticket), payload, TICKET_TTL);
        } catch (RuntimeException ex) {
            fallbackTickets.put(ticket, new Ticket(payload, Instant.now().plus(TICKET_TTL)));
        }
        return ticket;
    }

    public CurrentUser consumeTicket(String ticket, String orderId) {
        String payload = null;
        try {
            payload = stringRedisTemplate.opsForValue().get(ticketKey(ticket));
            stringRedisTemplate.delete(ticketKey(ticket));
        } catch (RuntimeException ex) {
            Ticket fallback = fallbackTickets.remove(ticket);
            if (fallback != null && fallback.expiresAt().isAfter(Instant.now())) {
                payload = fallback.payload();
            }
        }
        if (payload == null || payload.isBlank()) {
            return null;
        }
        String[] parts = payload.split("\\|", -1);
        if (parts.length != 4 || !parts[3].equals(orderId)) {
            return null;
        }
        return new CurrentUser(Long.valueOf(parts[0]), parts[1], parts[2]);
    }

    private String ticketKey(String ticket) {
        return "ws:ticket:" + ticket;
    }

    private record Ticket(String payload, Instant expiresAt) {
    }
}
