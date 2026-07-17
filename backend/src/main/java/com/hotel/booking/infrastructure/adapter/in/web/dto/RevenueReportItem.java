package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.math.BigDecimal;

public record RevenueReportItem(
    String roomTypeName,
    BigDecimal revenue,
    BigDecimal ratio
) {}
