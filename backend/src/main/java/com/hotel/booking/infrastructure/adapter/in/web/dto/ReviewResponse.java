package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReviewResponse(
    UUID id,
    String username,
    Integer rating,
    String comment,
    LocalDateTime createdAt
) {}
