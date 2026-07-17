package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
    UUID id,
    String customerOrgName,
    String address,
    BigDecimal totalAmount,
    LocalDateTime paymentDate,
    List<InvoiceDetailResponse> details
) {
    public record InvoiceDetailResponse(
        UUID id,
        UUID roomId,
        String roomNumber,
        String roomTypeName,
        Integer totalDays,
        BigDecimal basePriceSnapshot,
        BigDecimal surchargeRatioApplied,
        BigDecimal coefficientApplied,
        BigDecimal subTotal
    ) {}
}
