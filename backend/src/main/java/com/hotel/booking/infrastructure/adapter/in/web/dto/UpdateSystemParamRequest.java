package com.hotel.booking.infrastructure.adapter.in.web.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record UpdateSystemParamRequest(
    @NotNull(message = "Giá trị không được để trống") BigDecimal newValue
) {}
