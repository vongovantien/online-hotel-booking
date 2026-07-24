package com.hotel.booking.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "invoice_details")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDetailEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private InvoiceEntity invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private RoomEntity room;

    @Column(name = "room_type_name", nullable = false)
    private String roomTypeName;

    @Column(name = "total_days", nullable = false)
    private Integer totalDays;

    @Column(name = "base_price_snapshot", nullable = false)
    private BigDecimal basePriceSnapshot;

    @Column(name = "surcharge_ratio_applied", nullable = false, precision = 5, scale = 2)
    private BigDecimal surchargeRatioApplied;

    @Column(name = "coefficient_applied", nullable = false, precision = 5, scale = 2)
    private BigDecimal coefficientApplied;

    @Column(name = "service_charge")
    private BigDecimal serviceCharge;

    @Column(name = "sub_total", nullable = false)
    private BigDecimal subTotal;
}
