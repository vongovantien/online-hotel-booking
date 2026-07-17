package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, UUID> {
}
