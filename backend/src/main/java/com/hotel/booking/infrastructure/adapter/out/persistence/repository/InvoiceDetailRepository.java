package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.InvoiceDetailEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetailEntity, UUID> {

    /**
     * BM5.1 & BM5.2: Lấy danh sách chi tiết hóa đơn trong khoảng thời gian thanh toán.
     * Tự động join/fetch Room và Invoice để tính báo cáo tại tầng Service bằng Java Stream API (Clean Architecture).
     */
    @EntityGraph(attributePaths = {"room", "room.roomType", "invoice"})
    List<InvoiceDetailEntity> findByInvoice_PaymentDateBetween(LocalDateTime start, LocalDateTime end);
}
