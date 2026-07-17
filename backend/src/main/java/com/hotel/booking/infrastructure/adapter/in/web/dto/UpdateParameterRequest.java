package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.math.BigDecimal;

public record UpdateParameterRequest(
    String paramKey,
    BigDecimal paramValue
) {}
