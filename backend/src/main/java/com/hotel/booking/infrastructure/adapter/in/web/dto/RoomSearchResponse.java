package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RoomSearchResponse(
    UUID id,
    String roomNumber,
    String roomTypeName,
    BigDecimal price,
    String status,
    String note
) {}
