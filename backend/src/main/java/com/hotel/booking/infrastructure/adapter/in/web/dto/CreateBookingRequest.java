package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CreateBookingRequest(
    UUID roomId,
    LocalDateTime checkInDate,
    LocalDateTime checkOutDate,
    List<BookingGuestRequest> guests
) {
    public record BookingGuestRequest(
        String customerName,
        String customerType,
        String idCard,
        String address
    ) {}
}
