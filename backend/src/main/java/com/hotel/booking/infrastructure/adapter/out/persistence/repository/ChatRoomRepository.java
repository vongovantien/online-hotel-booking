package com.hotel.booking.infrastructure.adapter.out.persistence.repository;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ChatRoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, UUID> {
    List<ChatRoomEntity> findAllByOrderByLastMessageAtDesc();
    List<ChatRoomEntity> findByStatus(String status);
    Optional<ChatRoomEntity> findByCustomerEmailAndStatus(String customerEmail, String status);
    Optional<ChatRoomEntity> findByCustomerNameAndStatus(String customerName, String status);
}
