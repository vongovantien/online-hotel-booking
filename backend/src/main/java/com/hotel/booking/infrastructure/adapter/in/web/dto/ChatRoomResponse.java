package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatRoomResponse(
        UUID id,
        String customerName,
        String customerEmail,
        String status,
        int unreadAdminCount,
        String lastMessage,
        LocalDateTime lastMessageAt,
        LocalDateTime createdAt
) {}
