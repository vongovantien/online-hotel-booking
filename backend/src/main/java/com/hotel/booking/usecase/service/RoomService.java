package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.CreateOrUpdateRoomRequest;
import com.hotel.booking.infrastructure.adapter.in.web.dto.RoomSearchResponse;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomStatusEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomTypeEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public RoomService(RoomRepository roomRepository, RoomTypeRepository roomTypeRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    /**
     * BM3: Tra cứu phòng với bộ lọc tùy chọn theo loại phòng và tình trạng.
     */
    @Transactional(readOnly = true)
    public List<RoomSearchResponse> searchRooms(String typeName, String status) {
        List<RoomEntity> rooms;

        RoomStatusEntity statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                statusEnum = RoomStatusEntity.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status enum parameter mapping
            }
        }

        if (typeName != null && !typeName.isBlank() && statusEnum != null) {
            rooms = roomRepository.findByStatusAndRoomType_TypeName(statusEnum, typeName.toUpperCase());
        } else if (typeName != null && !typeName.isBlank()) {
            rooms = roomRepository.findByRoomType_TypeName(typeName.toUpperCase());
        } else if (statusEnum != null) {
            rooms = roomRepository.findByStatus(statusEnum);
        } else {
            rooms = roomRepository.findAll();
        }

        return rooms.stream().map(this::toResponse).toList();
    }

    @Transactional
    public RoomSearchResponse createRoom(CreateOrUpdateRoomRequest req) {
        if (roomRepository.findByRoomNumber(req.roomNumber().trim()).isPresent()) {
            throw new IllegalArgumentException("Số phòng đã tồn tại: " + req.roomNumber());
        }
        RoomTypeEntity roomType = roomTypeRepository.findByTypeName(req.roomTypeName().trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại phòng: " + req.roomTypeName()));

        RoomStatusEntity statusEnum = RoomStatusEntity.AVAILABLE;
        if (req.status() != null && !req.status().isBlank()) {
            try {
                statusEnum = RoomStatusEntity.valueOf(req.status().toUpperCase());
            } catch (Exception ignored) {}
        }

        RoomEntity room = RoomEntity.builder()
                .roomNumber(req.roomNumber().trim())
                .roomType(roomType)
                .status(statusEnum)
                .note(req.note())
                .build();
        room = roomRepository.save(room);
        return toResponse(room);
    }

    @Transactional
    public RoomSearchResponse updateRoom(UUID id, CreateOrUpdateRoomRequest req) {
        RoomEntity room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng với ID: " + id));

        if (!room.getRoomNumber().equalsIgnoreCase(req.roomNumber().trim())) {
            if (roomRepository.findByRoomNumber(req.roomNumber().trim()).isPresent()) {
                throw new IllegalArgumentException("Số phòng đã tồn tại: " + req.roomNumber());
            }
            room.setRoomNumber(req.roomNumber().trim());
        }

        if (req.roomTypeName() != null && !req.roomTypeName().isBlank() &&
            !room.getRoomType().getTypeName().equalsIgnoreCase(req.roomTypeName().trim())) {
            RoomTypeEntity roomType = roomTypeRepository.findByTypeName(req.roomTypeName().trim().toUpperCase())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại phòng: " + req.roomTypeName()));
            room.setRoomType(roomType);
        }

        if (req.status() != null && !req.status().isBlank()) {
            try {
                room.setStatus(RoomStatusEntity.valueOf(req.status().toUpperCase()));
            } catch (Exception ignored) {}
        }
        room.setNote(req.note());
        room = roomRepository.save(room);
        return toResponse(room);
    }

    @Transactional
    public void deleteRoom(UUID id) {
        RoomEntity room = roomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng với ID: " + id));
        if (room.getStatus() == RoomStatusEntity.RENTED) {
            throw new IllegalStateException("Không thể xóa phòng đang có khách thuê (RENTED)!");
        }
        roomRepository.delete(room);
    }

    private RoomSearchResponse toResponse(RoomEntity room) {
        return new RoomSearchResponse(
                room.getId(),
                room.getRoomNumber(),
                room.getRoomType().getTypeName(),
                room.getRoomType().getBasePrice(),
                room.getStatus().name(),
                room.getNote()
        );
    }
}
