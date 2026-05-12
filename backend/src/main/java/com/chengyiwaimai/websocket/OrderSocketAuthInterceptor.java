package com.chengyiwaimai.websocket;

import com.chengyiwaimai.common.BizException;
import com.chengyiwaimai.security.CurrentUser;
import com.chengyiwaimai.security.JwtUtil;
import com.chengyiwaimai.service.BusinessService;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class OrderSocketAuthInterceptor implements HandshakeInterceptor {
    public static final String ATTR_ORDER_ID = "orderId";
    public static final String ATTR_CURRENT_USER = "currentUser";

    private final JwtUtil jwtUtil;
    private final BusinessService businessService;

    public OrderSocketAuthInterceptor(JwtUtil jwtUtil, BusinessService businessService) {
        this.jwtUtil = jwtUtil;
        this.businessService = businessService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        Map<String, String> query = queryParams(request.getURI());
        String token = query.get("token");
        String orderId = query.get("orderId");
        if (token == null || token.isBlank() || orderId == null || orderId.isBlank()) {
            return false;
        }
        try {
            CurrentUser user = jwtUtil.parseToken(token.trim());
            businessService.requireOrderSubscription(user, orderId.trim());
            attributes.put(ATTR_CURRENT_USER, user);
            attributes.put(ATTR_ORDER_ID, orderId.trim());
            return true;
        } catch (BizException ex) {
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
    }

    private Map<String, String> queryParams(URI uri) {
        String query = uri == null ? null : uri.getRawQuery();
        if (query == null || query.isBlank()) {
            return Map.of();
        }
        java.util.HashMap<String, String> params = new java.util.HashMap<>();
        for (String part : query.split("&")) {
            int index = part.indexOf('=');
            if (index <= 0) {
                continue;
            }
            String key = URLDecoder.decode(part.substring(0, index), StandardCharsets.UTF_8);
            String value = URLDecoder.decode(part.substring(index + 1), StandardCharsets.UTF_8);
            params.put(key, value);
        }
        return params;
    }
}
