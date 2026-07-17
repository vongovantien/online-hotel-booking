package com.hotel.booking.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateOrUpdateRoomRequest(
    @NotBlank(message = "Số phòng không được để trống")
    String roomNumber,
    @NotBlank(message = "Loại phòng không được để trống")
    String roomTypeName,
    String status,
    String note
) {}
