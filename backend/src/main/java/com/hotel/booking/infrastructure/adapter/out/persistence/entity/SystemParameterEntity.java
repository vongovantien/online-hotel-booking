package com.hotel.booking.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_parameters")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemParameterEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "param_key", unique = true, nullable = false)
    private String paramKey;

    @Column(name = "param_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal paramValue;

    private String description;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
