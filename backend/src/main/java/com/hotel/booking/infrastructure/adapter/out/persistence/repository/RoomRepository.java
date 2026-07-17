package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<RoomEntity, UUID> {
    Optional<RoomEntity> findByRoomNumber(String roomNumber);
    List<RoomEntity> findByStatus(RoomStatusEntity status);
    List<RoomEntity> findByRoomType_TypeName(String typeName);
    List<RoomEntity> findByStatusAndRoomType_TypeName(RoomStatusEntity status, String typeName);
}
