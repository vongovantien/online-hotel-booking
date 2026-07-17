package com.hotel.booking.infrastructure.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_number", unique = true, nullable = false)
    private String roomNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id")
    private RoomTypeEntity roomType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatusEntity status;

    private String note;
}
