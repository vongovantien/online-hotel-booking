package com.hotel.booking.infrastructure.adapter.in.web.dto;

import java.util.UUID;

public record AddServiceRequest(
    UUID serviceId,
    Integer quantity
) {}
