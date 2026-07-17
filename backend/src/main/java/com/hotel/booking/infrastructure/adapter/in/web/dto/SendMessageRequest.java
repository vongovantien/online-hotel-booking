package com.hotel.booking.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;

public record SendMessageRequest(
        @NotBlank(message = "Vai trò người gửi không được để trống")
        String senderRole,
        @NotBlank(message = "Tên người gửi không được để trống")
        String senderName,
        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        String content
) {}
