package com.hotel.booking.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Hóa đơn thanh toán — BM4.
 * Immutable sau khi tạo (snapshot, không bao giờ sửa — QĐ6).
 */
public class Invoice {

    private final UUID id;
    private final String customerOrgName;
    private final String address;
    private final BigDecimal totalAmount;
    private final LocalDateTime paymentDate;
    private final List<InvoiceDetail> details;

    private Invoice(Builder b) {
        this.id = b.id;
        this.customerOrgName = b.customerOrgName;
        this.address = b.address;
        this.paymentDate = b.paymentDate;
        this.details = b.details != null ? Collections.unmodifiableList(b.details) : Collections.emptyList();
        this.totalAmount = this.details.stream()
                .map(InvoiceDetail::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public UUID getId()                { return id; }
    public String getCustomerOrgName() { return customerOrgName; }
    public String getAddress()         { return address; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public List<InvoiceDetail> getDetails() { return details; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String customerOrgName;
        private String address;
        private LocalDateTime paymentDate;
        private List<InvoiceDetail> details;

        public Builder id(UUID v)                    { this.id = v; return this; }
        public Builder customerOrgName(String v)     { this.customerOrgName = v; return this; }
        public Builder address(String v)             { this.address = v; return this; }
        public Builder paymentDate(LocalDateTime v)  { this.paymentDate = v; return this; }
        public Builder details(List<InvoiceDetail> v){ this.details = v; return this; }
        public Invoice build()                       { return new Invoice(this); }
    }
}
