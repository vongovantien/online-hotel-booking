package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RentalSlipResponse(
    UUID id,
    RoomSearchResponse room,
    LocalDateTime startDate,
    String status,
    LocalDateTime createdAt,
    List<CustomerDetailResponse> details
) {
    public record CustomerDetailResponse(
        UUID id,
        String customerName,
        String customerType,
        String idCard,
        String address
    ) {}
}
