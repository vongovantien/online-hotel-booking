package com.hotel.booking.infrastructure.adapter.in.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

@Schema(description = "Thông tin lập hóa đơn thanh toán — BM4")
public record CheckoutRequest(
    @NotBlank(message = "Tên khách hàng / cơ quan thanh toán không được để trống")
    String customerOrgName,

    String address,

    @NotEmpty(message = "Phải có ít nhất 1 phòng để thanh toán")
    List<UUID> roomIds
) {}
