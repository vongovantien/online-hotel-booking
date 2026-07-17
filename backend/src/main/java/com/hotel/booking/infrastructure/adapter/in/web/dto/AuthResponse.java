package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.util.UUID;

public record AuthResponse(
    String token,
    String tokenType,
    String username,
    String role,
    UUID userId
) {}
