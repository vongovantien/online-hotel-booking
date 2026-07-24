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

import java.security.Principal;

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

    @GetMapping("/profile")
    @Operation(summary = "Lấy hồ sơ người dùng hiện tại")
    public ResponseEntity<UserEntity> getProfile(Principal principal) {
        UserEntity user = authService.getUserProfile(principal.getName());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật email hồ sơ người dùng")
    public ResponseEntity<UserEntity> updateProfile(
            @RequestParam String email,
            Principal principal) {
        UserEntity user = authService.updateEmail(principal.getName(), email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<Void> changePassword(
            @RequestParam String oldPassword,
            @RequestParam String newPassword,
            Principal principal) {
        authService.changePassword(principal.getName(), oldPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    // ─── Admin User Management ───────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "Danh sách tất cả người dùng (Admin)")
    public ResponseEntity<java.util.List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Cập nhật vai trò người dùng (Admin)")
    public ResponseEntity<UserEntity> updateUserRole(
            @PathVariable java.util.UUID id,
            @RequestParam String role) {
        return ResponseEntity.ok(authService.updateUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Xóa người dùng (Admin)")
    public ResponseEntity<Void> deleteUser(@PathVariable java.util.UUID id) {
        authService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
