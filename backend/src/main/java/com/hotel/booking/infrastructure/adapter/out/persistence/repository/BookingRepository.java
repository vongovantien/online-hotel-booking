package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, UUID> {

    List<BookingEntity> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<BookingEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT b FROM BookingEntity b WHERE b.room.id = :roomId AND b.status <> 'CANCELLED' " +
           "AND b.checkInDate < :checkOut AND b.checkOutDate > :checkIn")
    List<BookingEntity> findOverlappingBookings(
            @Param("roomId") UUID roomId,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut
    );

    @Query("SELECT DISTINCT b.room.id FROM BookingEntity b WHERE b.status <> 'CANCELLED' " +
           "AND b.checkInDate < :checkOut AND b.checkOutDate > :checkIn")
    List<UUID> findBookedRoomIds(
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut
    );
}
