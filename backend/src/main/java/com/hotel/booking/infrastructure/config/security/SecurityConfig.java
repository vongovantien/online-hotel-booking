package com.hotel.booking.infrastructure.config.security;

import com.hotel.booking.domain.model.UserRole;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

/**
 * Cấu hình bảo mật phân quyền hệ thống Khách sạn theo chuẩn Enterprise Architecture.
 * Thay vì hardcode chuỗi ký tự cố định, hệ thống liên kết trực tiếp với Domain Enum (UserRole)
 * và kích hoạt Method Security (@EnableMethodSecurity) để kiểm soát quyền chi tiết đến từng hàm/nghiệp vụ.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@SuppressWarnings("unused")
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                corsConfiguration.setAllowedOrigins(List.of("*"));
                corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfiguration.setAllowedHeaders(List.of("*"));
                return corsConfiguration;
            }))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public auth paths
                .requestMatchers("/api/v1/auth/**").permitAll()
                // Swagger and documentation paths
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/api-docs/**", "/v3/api-docs/**").permitAll()
                // Rooms search & view is public
                .requestMatchers(HttpMethod.GET, "/api/v1/rooms/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/rooms/**").hasAnyRole(
                        UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                .requestMatchers(HttpMethod.PUT, "/api/v1/rooms/**").hasAnyRole(
                        UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                .requestMatchers(HttpMethod.DELETE, "/api/v1/rooms/**").hasAnyRole(
                        UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                // Live Chat — WebSocket endpoint & Khách hàng/Khách vãng lai có thể khởi tạo phòng chat và gửi/nhận tin nhắn
                .requestMatchers("/api/v1/ws-chat/**").permitAll()
                .requestMatchers("/api/v1/chat/init", "/api/v1/chat/rooms/{roomId}/messages", "/api/v1/chat/rooms/{roomId}").permitAll()
                // Rentals — Khách hàng và nhân viên có thể lập phiếu
                .requestMatchers(HttpMethod.POST, "/api/v1/rentals").hasAnyRole(
                        UserRole.CUSTOMER.name(), UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                .requestMatchers("/api/v1/rentals/**").hasAnyRole(
                        UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                .requestMatchers("/api/v1/invoices/checkout").hasAnyRole(
                        UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                // Quản lý Chat của Lễ tân & Admin
                .requestMatchers("/api/v1/chat/rooms").hasAnyRole(
                        UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                .requestMatchers("/api/v1/chat/rooms/{roomId}/read", "/api/v1/chat/rooms/{roomId}/close").hasAnyRole(
                        UserRole.RECEPTIONIST.name(), UserRole.ADMIN.name())
                // Reports & Parameters (Chỉ Admin)
                .requestMatchers("/api/v1/reports/**").hasRole(UserRole.ADMIN.name())
                .requestMatchers("/api/v1/parameters/**").hasRole(UserRole.ADMIN.name())
                .requestMatchers("/api/v1/room-types/**").hasRole(UserRole.ADMIN.name())
                // Các request còn lại yêu cầu xác thực
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
