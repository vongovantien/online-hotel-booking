package com.hotel.booking.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "services")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ServiceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "service_name", unique = true, nullable = false)
    private String serviceName;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String unit;
}
