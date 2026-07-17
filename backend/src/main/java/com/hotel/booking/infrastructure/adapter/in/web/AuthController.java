package com.hotel.booking.infrastructure.adapter.in.web;

import com.hotel.booking.infrastructure.adapter.in.web.dto.AuthResponse;
import com.hotel.booking.infrastructure.adapter.in.web.dto.LoginRequest;
import com.hotel.booking.infrastructure.adapter.in.web.dto.RegisterRequest;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.hotel.booking.usecase.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
@Tag(name = "Auth", description = "Đăng ký, đăng nhập, đăng xuất")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới",
               description = "Mật khẩu cần ít nhất 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt. Role: CUSTOMER / RECEPTIONIST / ADMIN")
    public ResponseEntity<UserEntity> register(@Valid @RequestBody RegisterRequest request) {
        UserEntity user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập — nhận JWT token",
               description = "Dùng token nhận được để gọi các API khác: `Authorization: Bearer <token>`")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất — blacklist token trong Redis")
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        authService.logout(authHeader);
        return ResponseEntity.ok().build();
    }
}
