package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID roomId,
        String senderRole,
        String senderName,
        String content,
        LocalDateTime createdAt
) {}
