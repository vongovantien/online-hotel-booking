package com.hotel.booking.infrastructure.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI hotelManagementOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hotel Management API")
                        .description("""
                                Hệ thống quản lý khách sạn — Clean Architecture, Java 21, RBAC.

                                **Roles & Permissions:**
                                - `CUSTOMER`      → BM3: Xem phòng
                                - `RECEPTIONIST`  → BM2: Lập phiếu thuê + BM4: Hóa đơn
                                - `ADMIN`         → Toàn quyền + BM5: Báo cáo + QĐ6: Cấu hình

                                **Đăng nhập mặc định:**
                                | Username | Password | Role |
                                |---|---|---|
                                | admin | admin123 | ADMIN |
                                | receptionist | recep123 | RECEPTIONIST |
                                | customer | cust123 | CUSTOMER |
                                """)
                        .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT token từ POST /api/v1/auth/login")));
    }
}
