package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.RentalRequest;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.*;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RentalSlipRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.SystemParameterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RentalService {

    private final RentalSlipRepository rentalSlipRepository;
    private final RoomRepository roomRepository;
    private final SystemParameterRepository systemParameterRepository;

    public RentalService(RentalSlipRepository rentalSlipRepository,
                         RoomRepository roomRepository,
                         SystemParameterRepository systemParameterRepository) {
        this.rentalSlipRepository = rentalSlipRepository;
        this.roomRepository = roomRepository;
        this.systemParameterRepository = systemParameterRepository;
    }

    /**
     * BM2 & QĐ2: Lập phiếu thuê phòng.
     */
    @Transactional
    public RentalSlipEntity createRental(RentalRequest request) {
        RoomEntity room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại: " + request.roomId()));

        if (room.getStatus() != RoomStatusEntity.AVAILABLE) {
            throw new IllegalStateException("Phòng " + room.getRoomNumber() + " đang được thuê hoặc bảo trì.");
        }

        int maxGuests = systemParameterRepository.findByParamKey("MAX_GUESTS_PER_ROOM")
                .map(p -> p.getParamValue().intValue())
                .orElse(3);

        if (request.customers() == null || request.customers().isEmpty()) {
            throw new IllegalArgumentException("Danh sách khách hàng không được để trống.");
        }
        if (request.customers().size() > maxGuests) {
            throw new IllegalArgumentException(
                    "Số lượng khách vượt quá quy định: tối đa " + maxGuests + " khách/phòng.");
        }

        RentalSlipEntity rentalSlip = RentalSlipEntity.builder()
                .room(room)
                .startDate(request.startDate() != null ? request.startDate() : LocalDateTime.now())
                .status(RentalSlipStatusEntity.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        List<RentalSlipDetailEntity> details = request.customers().stream()
                .map(c -> RentalSlipDetailEntity.builder()
                        .rentalSlip(rentalSlip)
                        .customerName(c.customerName())
                        .customerType(CustomerTypeEntity.valueOf(c.customerType().toUpperCase()))
                        .idCard(c.idCard())
                        .address(c.address())
                        .build())
                .toList();

        rentalSlip.setDetails(details);

        room.setStatus(RoomStatusEntity.RENTED);
        roomRepository.save(room);

        return rentalSlipRepository.save(rentalSlip);
    }

    public List<RentalSlipEntity> getActiveRentals() {
        return rentalSlipRepository.findByStatus(RentalSlipStatusEntity.ACTIVE);
    }

    public RentalSlipEntity findActiveRentalByRoomId(java.util.UUID roomId) {
        return rentalSlipRepository.findByRoom_IdAndStatus(roomId, RentalSlipStatusEntity.ACTIVE)
                .stream().findFirst()
                .orElse(null);
    }
}
