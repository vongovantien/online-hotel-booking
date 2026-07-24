package com.hotel.booking.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateReviewRequest(
    @NotNull(message = "ID loại phòng không được để trống")
    UUID roomTypeId,

    @NotNull(message = "Số sao không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    Integer rating,

    @NotBlank(message = "Nội dung đánh giá không được để trống")
    String comment
) {}
