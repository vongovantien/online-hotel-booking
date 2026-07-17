package com.hotel.booking.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "rental_slip_details")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RentalSlipDetailEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rental_slip_id")
    private RentalSlipEntity rentalSlip;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false)
    private CustomerTypeEntity customerType;

    @Column(name = "id_card", nullable = false)
    private String idCard;

    private String address;
}
