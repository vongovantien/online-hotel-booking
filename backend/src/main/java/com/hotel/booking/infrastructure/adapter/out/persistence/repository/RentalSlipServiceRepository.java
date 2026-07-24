package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RentalSlipServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RentalSlipServiceRepository extends JpaRepository<RentalSlipServiceEntity, UUID> {
    List<RentalSlipServiceEntity> findByRentalSlip_Id(UUID rentalSlipId);
}
