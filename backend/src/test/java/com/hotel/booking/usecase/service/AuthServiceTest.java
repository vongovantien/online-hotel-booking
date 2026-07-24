package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.RegisterRequest;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.UserRepository;
import com.hotel.booking.infrastructure.config.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RedissonClient;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;
    @Mock private RedissonClient redissonClient;

    private AuthService authService;

    private final String USERNAME = "testuser";
    private final String EMAIL = "test@hotel.com";

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, jwtService, redissonClient);
    }

    @Test
    @DisplayName("Đăng ký người dùng mới thành công")
    void register_success() {
        RegisterRequest request = new RegisterRequest(USERNAME, EMAIL, "Pass123!", "CUSTOMER");

        when(userRepository.existsByUsername(USERNAME)).thenReturn(false);
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity user = authService.register(request);

        assertThat(user).isNotNull();
        assertThat(user.getUsername()).isEqualTo(USERNAME);
        assertThat(user.getEmail()).isEqualTo(EMAIL);
        assertThat(user.getRole()).isEqualTo("CUSTOMER");

        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi trùng tên đăng nhập")
    void register_duplicateUsername_throwsException() {
        RegisterRequest request = new RegisterRequest(USERNAME, EMAIL, "Pass123!", "CUSTOMER");

        when(userRepository.existsByUsername(USERNAME)).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Tên đăng nhập đã tồn tại");
    }

    @Test
    @DisplayName("Ném ngoại lệ khi mật khẩu yếu")
    void register_weakPassword_throwsException() {
        RegisterRequest request = new RegisterRequest(USERNAME, EMAIL, "weakpassword", "CUSTOMER");

        when(userRepository.existsByUsername(USERNAME)).thenReturn(false);
        when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Mật khẩu phải chứa ít nhất 8 ký tự");
    }

    @Test
    @DisplayName("Cập nhật email thành công")
    void updateEmail_success() {
        UserEntity user = UserEntity.builder().username(USERNAME).email("old@hotel.com").build();
        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmail("new@hotel.com")).thenReturn(false);
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserEntity updated = authService.updateEmail(USERNAME, "new@hotel.com");

        assertThat(updated.getEmail()).isEqualTo("new@hotel.com");
        verify(userRepository, times(1)).save(user);
    }
}
