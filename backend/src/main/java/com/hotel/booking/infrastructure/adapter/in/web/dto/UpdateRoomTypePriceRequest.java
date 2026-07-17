package com.hotel.booking.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateRoomTypePriceRequest(
    @NotNull @DecimalMin(value = "1000", message = "Đơn giá tối thiểu là 1,000đ")
    BigDecimal newPrice
) {}
