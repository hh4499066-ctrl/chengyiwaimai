package com.chengyiwaimai.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final OrderSocketHandler orderSocketHandler;

    public WebSocketConfig(OrderSocketHandler orderSocketHandler) {
        this.orderSocketHandler = orderSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(orderSocketHandler, "/ws/orders").setAllowedOriginPatterns("*");
    }
}
