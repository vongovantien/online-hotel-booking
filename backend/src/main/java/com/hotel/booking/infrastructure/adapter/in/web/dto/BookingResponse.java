package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BookingResponse(
    UUID id,
    UUID roomId,
    String roomNumber,
    String roomTypeName,
    LocalDateTime checkInDate,
    LocalDateTime checkOutDate,
    String status,
    BigDecimal estimatedPrice,
    LocalDateTime createdAt,
    List<BookingGuestResponse> guests
) {
    public record BookingGuestResponse(
        UUID id,
        String customerName,
        String customerType,
        String idCard,
        String address
    ) {}
}
