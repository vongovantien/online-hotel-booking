package com.hotel.booking.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Loại phòng (A, B, C) — QĐ1.
 * Đơn giá configurable, không hardcode — QĐ6.
 */
public class RoomType {

    private final UUID id;
    private final String typeName;
    private BigDecimal basePrice;
    private final String description;

    private RoomType(Builder b) {
        this.id = b.id;
        this.typeName = b.typeName;
        this.basePrice = b.basePrice;
        this.description = b.description;
    }

    public void updateBasePrice(BigDecimal newPrice) {
        if (newPrice == null || newPrice.compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Đơn giá phải lớn hơn 0");
        this.basePrice = newPrice;
    }

    public UUID getId()           { return id; }
    public String getTypeName()   { return typeName; }
    public BigDecimal getBasePrice() { return basePrice; }
    public String getDescription() { return description; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String typeName;
        private BigDecimal basePrice;
        private String description;

        public Builder id(UUID id)                   { this.id = id; return this; }
        public Builder typeName(String v)            { this.typeName = v; return this; }
        public Builder basePrice(BigDecimal v)       { this.basePrice = v; return this; }
        public Builder description(String v)         { this.description = v; return this; }
        public RoomType build()                      { return new RoomType(this); }
    }
}
