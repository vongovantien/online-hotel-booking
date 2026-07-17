package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record UtilizationReportItem(
    UUID roomId,
    String roomNumber,
    int rentedDays,
    BigDecimal densityRatio
) {}
