package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.CheckoutRequest;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.*;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.*;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class InvoiceService {

    private final RentalSlipRepository rentalSlipRepository;
    private final RoomRepository roomRepository;
    private final SystemParameterRepository systemParameterRepository;
    private final InvoiceRepository invoiceRepository;
    private final RedissonClient redissonClient;

    public InvoiceService(RentalSlipRepository rentalSlipRepository,
                          RoomRepository roomRepository,
                          SystemParameterRepository systemParameterRepository,
                          InvoiceRepository invoiceRepository,
                          RedissonClient redissonClient) {
        this.rentalSlipRepository = rentalSlipRepository;
        this.roomRepository = roomRepository;
        this.systemParameterRepository = systemParameterRepository;
        this.invoiceRepository = invoiceRepository;
        this.redissonClient = redissonClient;
    }

    /**
     * BM4 & QĐ4: Lập hóa đơn thanh toán với phụ thu.
     */
    @Transactional
    public InvoiceEntity processCheckout(CheckoutRequest request) {
        BigDecimal surchargeRate = systemParameterRepository.findByParamKey("SURCHARGE_RATIO_3RD_GUEST")
                .map(SystemParameterEntity::getParamValue)
                .orElse(new BigDecimal("0.25"));

        BigDecimal foreignCoefficient = systemParameterRepository.findByParamKey("FOREIGN_GUEST_COEFFICIENT")
                .map(SystemParameterEntity::getParamValue)
                .orElse(new BigDecimal("1.50"));

        InvoiceEntity invoice = InvoiceEntity.builder()
                .customerOrgName(request.customerOrgName())
                .address(request.address())
                .totalAmount(BigDecimal.ZERO)
                .paymentDate(LocalDateTime.now())
                .details(new ArrayList<>())
                .build();

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (UUID roomId : request.roomIds()) {
            RentalSlipEntity rental = rentalSlipRepository.findByRoom_IdAndStatus(roomId, RentalSlipStatusEntity.ACTIVE)
                    .stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu thuê hoạt động cho phòng ID: " + roomId));

            RoomEntity room = rental.getRoom();
            String lockKey = "lock:room:" + room.getId();
            RLock lock = redissonClient.getLock(lockKey);

            try {
                boolean acquired = lock.tryLock(0, 30, TimeUnit.SECONDS);
                if (!acquired) {
                    throw new IllegalStateException(
                            "Phòng " + room.getRoomNumber() + " đang được xử lý thanh toán bởi nhân viên khác.");
                }

                if (rental.getStatus() != RentalSlipStatusEntity.ACTIVE) {
                    throw new IllegalStateException("Phiếu thuê phòng " + room.getRoomNumber() + " đã được thanh toán.");
                }

                long days = Duration.between(rental.getStartDate(), LocalDateTime.now()).toDays();
                if (days <= 0) days = 1;

                List<RentalSlipDetailEntity> guests = rental.getDetails();
                int guestCount = guests.size();
                boolean hasForeign = guests.stream()
                        .anyMatch(g -> g.getCustomerType() == CustomerTypeEntity.FOREIGN);

                BigDecimal basePrice = room.getRoomType().getBasePrice();
                BigDecimal actualSurchargeRatio = guestCount >= 3 ? surchargeRate : BigDecimal.ZERO;
                BigDecimal actualCoefficient = hasForeign ? foreignCoefficient : BigDecimal.ONE;

                BigDecimal subTotal = BigDecimal.valueOf(days)
                        .multiply(basePrice)
                        .multiply(BigDecimal.ONE.add(actualSurchargeRatio))
                        .multiply(actualCoefficient)
                        .setScale(2, RoundingMode.HALF_UP);

                InvoiceDetailEntity detail = InvoiceDetailEntity.builder()
                        .invoice(invoice)
                        .room(room)
                        .roomTypeName(room.getRoomType().getTypeName())
                        .totalDays((int) days)
                        .basePriceSnapshot(basePrice)
                        .surchargeRatioApplied(actualSurchargeRatio)
                        .coefficientApplied(actualCoefficient)
                        .subTotal(subTotal)
                        .build();

                invoice.getDetails().add(detail);
                grandTotal = grandTotal.add(subTotal);

                rental.setStatus(RentalSlipStatusEntity.COMPLETED);
                rentalSlipRepository.save(rental);

                room.setStatus(RoomStatusEntity.AVAILABLE);
                roomRepository.save(room);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Lỗi xử lý khóa phân tán khi thanh toán phòng " + room.getRoomNumber());
            } finally {
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
        }

        invoice.setTotalAmount(grandTotal);
        return invoiceRepository.save(invoice);
    }
}
