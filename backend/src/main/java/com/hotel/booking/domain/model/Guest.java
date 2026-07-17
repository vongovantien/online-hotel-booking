package com.hotel.booking.domain.model;

import java.util.UUID;

/**
 * Khách hàng lưu trú — QĐ2.
 * Phân biệt nội địa / nước ngoài để tính hệ số phí — QĐ4.
 */
public class Guest {

    private final UUID id;
    private final String customerName;
    private final CustomerType customerType;
    private final String idCard;
    private final String address;

    private Guest(Builder b) {
        this.id = b.id;
        this.customerName = b.customerName;
        this.customerType = b.customerType;
        this.idCard = b.idCard;
        this.address = b.address;
    }

    public boolean isForeign() { return this.customerType == CustomerType.FOREIGN; }

    public UUID getId()               { return id; }
    public String getCustomerName()   { return customerName; }
    public CustomerType getCustomerType() { return customerType; }
    public String getIdCard()         { return idCard; }
    public String getAddress()        { return address; }

    public static Builder builder()   { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String customerName;
        private CustomerType customerType;
        private String idCard;
        private String address;

        public Builder id(UUID id)                   { this.id = id; return this; }
        public Builder customerName(String v)        { this.customerName = v; return this; }
        public Builder customerType(CustomerType v)  { this.customerType = v; return this; }
        public Builder idCard(String v)              { this.idCard = v; return this; }
        public Builder address(String v)             { this.address = v; return this; }
        public Guest build()                         { return new Guest(this); }
    }
}
