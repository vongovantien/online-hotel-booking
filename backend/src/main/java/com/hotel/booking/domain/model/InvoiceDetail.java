package com.hotel.booking.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

/**
 * Chi tiết hóa đơn 1 phòng — QĐ4.
 * Lưu snapshot tất cả giá trị tại thời điểm checkout để đảm bảo
 * toàn vẹn dữ liệu tài chính (QĐ6 — thay đổi giá sau không ảnh hưởng hóa đơn cũ).
 */
public class InvoiceDetail {

    private final UUID id;
    private final UUID roomId;
    private final String roomNumber;
    private final String roomTypeName;
    private final int totalDays;

    // Snapshots tại thời điểm checkout
    private final BigDecimal basePriceSnapshot;
    private final BigDecimal surchargeRatioApplied;
    private final BigDecimal coefficientApplied;
    private final BigDecimal subTotal;

    private InvoiceDetail(Builder b) {
        this.id = b.id;
        this.roomId = b.roomId;
        this.roomNumber = b.roomNumber;
        this.roomTypeName = b.roomTypeName;
        this.totalDays = b.totalDays;
        this.basePriceSnapshot = b.basePriceSnapshot;
        this.surchargeRatioApplied = b.surchargeRatioApplied;
        this.coefficientApplied = b.coefficientApplied;
        this.subTotal = b.subTotal;
    }

    /**
     * QĐ4 — Factory method: tính thành tiền và tạo InvoiceDetail.
     * Thành tiền = Số ngày × Đơn giá × (1 + phụ thu) × hệ số nước ngoài
     */
    public static InvoiceDetail calculate(UUID id,
                                          Room room,
                                          RentalSlip rental,
                                          long days,
                                          BigDecimal surchargeRate,
                                          BigDecimal foreignCoefficient) {
        int guestCount    = rental.getGuestCount();
        boolean hasForeign = rental.hasForeignGuest();

        BigDecimal basePrice         = room.getRoomType().getBasePrice();
        BigDecimal actualSurcharge   = guestCount >= 3 ? surchargeRate : BigDecimal.ZERO;
        BigDecimal actualCoefficient = hasForeign ? foreignCoefficient : BigDecimal.ONE;

        BigDecimal subTotal = BigDecimal.valueOf(days)
                .multiply(basePrice)
                .multiply(BigDecimal.ONE.add(actualSurcharge))
                .multiply(actualCoefficient)
                .setScale(2, RoundingMode.HALF_UP);

        return InvoiceDetail.builder()
                .id(id)
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomTypeName(room.getRoomType().getTypeName())
                .totalDays((int) days)
                .basePriceSnapshot(basePrice)
                .surchargeRatioApplied(actualSurcharge)
                .coefficientApplied(actualCoefficient)
                .subTotal(subTotal)
                .build();
    }

    public UUID getId()                        { return id; }
    public UUID getRoomId()                    { return roomId; }
    public String getRoomNumber()              { return roomNumber; }
    public String getRoomTypeName()            { return roomTypeName; }
    public int getTotalDays()                  { return totalDays; }
    public BigDecimal getBasePriceSnapshot()   { return basePriceSnapshot; }
    public BigDecimal getSurchargeRatioApplied(){ return surchargeRatioApplied; }
    public BigDecimal getCoefficientApplied()  { return coefficientApplied; }
    public BigDecimal getSubTotal()            { return subTotal; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private UUID roomId;
        private String roomNumber;
        private String roomTypeName;
        private int totalDays;
        private BigDecimal basePriceSnapshot;
        private BigDecimal surchargeRatioApplied;
        private BigDecimal coefficientApplied;
        private BigDecimal subTotal;

        public Builder id(UUID v)                      { this.id = v; return this; }
        public Builder roomId(UUID v)                  { this.roomId = v; return this; }
        public Builder roomNumber(String v)            { this.roomNumber = v; return this; }
        public Builder roomTypeName(String v)          { this.roomTypeName = v; return this; }
        public Builder totalDays(int v)                { this.totalDays = v; return this; }
        public Builder basePriceSnapshot(BigDecimal v) { this.basePriceSnapshot = v; return this; }
        public Builder surchargeRatioApplied(BigDecimal v){ this.surchargeRatioApplied = v; return this; }
        public Builder coefficientApplied(BigDecimal v){ this.coefficientApplied = v; return this; }
        public Builder subTotal(BigDecimal v)          { this.subTotal = v; return this; }
        public InvoiceDetail build()                   { return new InvoiceDetail(this); }
    }
}
