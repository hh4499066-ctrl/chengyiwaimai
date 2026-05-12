package com.chengyiwaimai.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    private final OrderSocketHandler orderSocketHandler;
    private final OrderSocketAuthInterceptor orderSocketAuthInterceptor;

    public WebSocketConfig(OrderSocketHandler orderSocketHandler, OrderSocketAuthInterceptor orderSocketAuthInterceptor) {
        this.orderSocketHandler = orderSocketHandler;
        this.orderSocketAuthInterceptor = orderSocketAuthInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(orderSocketHandler, "/ws/orders")
                .addInterceptors(orderSocketAuthInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
