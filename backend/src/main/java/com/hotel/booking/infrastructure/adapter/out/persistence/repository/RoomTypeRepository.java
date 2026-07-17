package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomTypeEntity, UUID> {
    Optional<RoomTypeEntity> findByTypeName(String typeName);
}
