package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.*;
import com.hotel.booking.infrastructure.adapter.in.web.exception.DuplicateResourceException;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.UserRepository;
import com.hotel.booking.infrastructure.config.security.JwtService;
import org.redisson.api.RedissonClient;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RedissonClient redissonClient;
    private final BCryptPasswordEncoder passwordEncoder;

    // Password strength regex: at least 1 uppercase, 1 digit, 1 special character, min 8 characters
    private static final Pattern PASSWORD_PATTERN = 
        Pattern.compile("^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$");

    public AuthService(UserRepository userRepository,
                       JwtService jwtService,
                       RedissonClient redissonClient) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.redissonClient = redissonClient;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Workflow A: User Registration (Forces CUSTOMER role to prevent privilege escalation)
     */
    @Transactional
    public UserEntity register(RegisterRequest request) {
        // 1. Check duplicate username
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Tên đăng nhập đã tồn tại.");
        }

        // 2. Check duplicate email
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email đã tồn tại.");
        }

        // 3. Password strength check
        if (!PASSWORD_PATTERN.matcher(request.password()).matches()) {
            throw new IllegalArgumentException(
                "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ số và một ký tự đặc biệt."
            );
        }

        // 4. BCrypt Hashing
        String hashedPassword = passwordEncoder.encode(request.password());

        // Always force role CUSTOMER for public self-registration
        UserEntity user = UserEntity.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(hashedPassword)
                .role("CUSTOMER")
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    /**
     * Workflow B: User Login
     */
    public AuthResponse login(LoginRequest request) {
        // 1. Find user by username or email
        UserEntity user = userRepository.findByUsername(request.usernameOrEmail())
                .or(() -> userRepository.findByEmail(request.usernameOrEmail()))
                .orElseThrow(() -> new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác"));

        // 2. BCrypt verify
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Tên đăng nhập hoặc mật khẩu không chính xác");
        }

        // 3. Generate JWT
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                user.getUsername(),
                user.getRole(),
                user.getId()
        );
    }

    /**
     * Workflow C: User Logout (Redis Blacklisting)
     */
    public void logout(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }

        String token = authHeader.substring(7);

        try {
            // Get expiration date and calculate TTL
            Date expiration = jwtService.extractExpiration(token);
            long remainingMs = expiration.getTime() - System.currentTimeMillis();

            if (remainingMs > 0) {
                // Blacklist token in Redis
                String redisKey = "token:blacklist:" + token;
                redissonClient.getBucket(redisKey).set("true", remainingMs, TimeUnit.MILLISECONDS);
            }
        } catch (Exception e) {
            // Handle parsing exceptions gracefully (e.g. malformed or expired tokens)
        }
    }

    public UserEntity getUserProfile(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + username));
    }

    @Transactional
    public UserEntity updateEmail(String username, String newEmail) {
        UserEntity user = getUserProfile(username);
        if (!user.getEmail().equalsIgnoreCase(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("Email đã tồn tại.");
        }
        user.setEmail(newEmail);
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        UserEntity user = getUserProfile(username);
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Mật khẩu cũ không chính xác.");
        }
        if (!PASSWORD_PATTERN.matcher(newPassword).matches()) {
            throw new IllegalArgumentException(
                "Mật khẩu mới phải chứa ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ số và một ký tự đặc biệt."
            );
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ─── Admin User Management ───────────────────────────────────────────────

    public java.util.List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public UserEntity updateUserRole(UUID userId, String newRole) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + userId));
        user.setRole(newRole.toUpperCase());
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("Không tìm thấy người dùng: " + userId);
        }
        userRepository.deleteById(userId);
    }
}