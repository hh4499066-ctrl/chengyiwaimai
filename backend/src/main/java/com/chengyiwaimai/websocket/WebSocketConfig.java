package com.chengyiwaimai.websocket;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final OrderSocketHandler orderSocketHandler;
    private final OrderSocketAuthInterceptor orderSocketAuthInterceptor;
    private final String[] allowedOrigins;

    public WebSocketConfig(OrderSocketHandler orderSocketHandler,
                           OrderSocketAuthInterceptor orderSocketAuthInterceptor,
                           @Value("${chengyi.allowed-origins}") String allowedOrigins) {
        this.orderSocketHandler = orderSocketHandler;
        this.orderSocketAuthInterceptor = orderSocketAuthInterceptor;
        this.allowedOrigins = java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toArray(String[]::new);
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(orderSocketHandler, "/ws/orders")
                .addInterceptors(orderSocketAuthInterceptor)
                .setAllowedOriginPatterns(allowedOrigins);
    }
}
