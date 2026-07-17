package com.hotel.booking.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record InitChatRequest(
        @NotBlank(message = "Tên khách hàng không được để trống")
        String customerName,
        String customerEmail
) {}
