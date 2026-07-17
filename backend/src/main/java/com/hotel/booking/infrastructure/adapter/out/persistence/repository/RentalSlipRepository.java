package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RentalSlipEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RentalSlipStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RentalSlipRepository extends JpaRepository<RentalSlipEntity, UUID> {
    List<RentalSlipEntity> findByRoom_IdAndStatus(UUID roomId, RentalSlipStatusEntity status);
    List<RentalSlipEntity> findByStatus(RentalSlipStatusEntity status);
}
