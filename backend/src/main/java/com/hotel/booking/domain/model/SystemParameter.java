package com.hotel.booking.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Tham số hệ thống — QĐ6.
 * Admin có thể thay đổi từ UI. Các service đọc từ đây thay vì hardcode.
 *
 * Các key chuẩn:
 *   MAX_GUESTS_PER_ROOM        (default: 3)
 *   SURCHARGE_RATIO_3RD_GUEST  (default: 0.25)
 *   FOREIGN_GUEST_COEFFICIENT  (default: 1.50)
 */
public class SystemParameter {

    private final Integer id;
    private final String paramKey;
    private BigDecimal paramValue;
    private final String description;
    private LocalDateTime updatedAt;

    private SystemParameter(Builder b) {
        this.id = b.id;
        this.paramKey = b.paramKey;
        this.paramValue = b.paramValue;
        this.description = b.description;
        this.updatedAt = b.updatedAt;
    }

    public void updateValue(BigDecimal newValue) {
        if (newValue == null) throw new IllegalArgumentException("Giá trị không được null");
        this.paramValue = newValue;
        this.updatedAt = LocalDateTime.now();
    }

    public Integer getId()          { return id; }
    public String getParamKey()     { return paramKey; }
    public BigDecimal getParamValue() { return paramValue; }
    public String getDescription()  { return description; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Integer id;
        private String paramKey;
        private BigDecimal paramValue;
        private String description;
        private LocalDateTime updatedAt;

        public Builder id(Integer v)             { this.id = v; return this; }
        public Builder paramKey(String v)        { this.paramKey = v; return this; }
        public Builder paramValue(BigDecimal v)  { this.paramValue = v; return this; }
        public Builder description(String v)     { this.description = v; return this; }
        public Builder updatedAt(LocalDateTime v){ this.updatedAt = v; return this; }
        public SystemParameter build()           { return new SystemParameter(this); }
    }
}
