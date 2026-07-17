package com.hotel.booking.infrastructure.config.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Kích hoạt simple broker cho các client subscribe vào /topic
        config.enableSimpleBroker("/topic");
        // Prefix cho các message gửi từ client lên server (nếu cần)
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký endpoint WebSocket thuần + SockJS fallback cho phép mọi origin
        registry.addEndpoint("/api/v1/ws-chat")
                .setAllowedOriginPatterns("*");

        registry.addEndpoint("/api/v1/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
