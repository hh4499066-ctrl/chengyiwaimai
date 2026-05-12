package com.chengyiwaimai.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class OrderSocketHandler extends TextWebSocketHandler {
    private final Map<String, Set<WebSocketSession>> sessionsByOrderId = new ConcurrentHashMap<>();
    private final Map<String, String> orderIdBySessionId = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String orderId = (String) session.getAttributes().get(OrderSocketAuthInterceptor.ATTR_ORDER_ID);
        if (orderId == null || orderId.isBlank()) {
            return;
        }
        sessionsByOrderId.computeIfAbsent(orderId, key -> new CopyOnWriteArraySet<>()).add(session);
        orderIdBySessionId.put(session.getId(), orderId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        removeSession(session);
    }

    public void broadcast(String orderId, String message) {
        sendTo(sessionsByOrderId.get(orderId), message);
    }

    private void sendTo(Set<WebSocketSession> sessions, String message) {
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(message));
                } catch (IOException ignored) {
                    removeSession(session);
                }
            } else {
                removeSession(session);
            }
        }
    }

    private void removeSession(WebSocketSession session) {
        String orderId = orderIdBySessionId.remove(session.getId());
        if (orderId == null) {
            return;
        }
        Set<WebSocketSession> sessions = sessionsByOrderId.get(orderId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                sessionsByOrderId.remove(orderId);
            }
        }
    }

}
