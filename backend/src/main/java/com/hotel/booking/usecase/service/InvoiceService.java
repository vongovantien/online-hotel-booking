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
    private final RentalSlipServiceRepository rentalSlipServiceRepository;
    private final EmailService emailService;
    private final BookingRepository bookingRepository;

    public InvoiceService(RentalSlipRepository rentalSlipRepository,
                          RoomRepository roomRepository,
                          SystemParameterRepository systemParameterRepository,
                          InvoiceRepository invoiceRepository,
                          RedissonClient redissonClient,
                          RentalSlipServiceRepository rentalSlipServiceRepository,
                          EmailService emailService,
                          BookingRepository bookingRepository) {
        this.rentalSlipRepository = rentalSlipRepository;
        this.roomRepository = roomRepository;
        this.systemParameterRepository = systemParameterRepository;
        this.invoiceRepository = invoiceRepository;
        this.redissonClient = redissonClient;
        this.rentalSlipServiceRepository = rentalSlipServiceRepository;
        this.emailService = emailService;
        this.bookingRepository = bookingRepository;
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
                .paymentMethod(request.paymentMethod())
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

                // Load services used
                List<RentalSlipServiceEntity> servicesUsed = rentalSlipServiceRepository.findByRentalSlip_Id(rental.getId());
                BigDecimal serviceCharge = servicesUsed.stream()
                        .map(s -> s.getPriceSnapshot().multiply(BigDecimal.valueOf(s.getQuantity())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal roomCost = BigDecimal.valueOf(days)
                        .multiply(basePrice)
                        .multiply(BigDecimal.ONE.add(actualSurchargeRatio))
                        .multiply(actualCoefficient);

                BigDecimal subTotal = roomCost.add(serviceCharge).setScale(2, RoundingMode.HALF_UP);

                InvoiceDetailEntity detail = InvoiceDetailEntity.builder()
                        .invoice(invoice)
                        .room(room)
                        .roomTypeName(room.getRoomType().getTypeName())
                        .totalDays((int) days)
                        .basePriceSnapshot(basePrice)
                        .surchargeRatioApplied(actualSurchargeRatio)
                        .coefficientApplied(actualCoefficient)
                        .serviceCharge(serviceCharge)
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
        InvoiceEntity savedInvoice = invoiceRepository.save(invoice);

        // Find customer email to send invoice (from booking if exists)
        try {
            for (UUID roomId : request.roomIds()) {
                List<BookingEntity> roomBookings = bookingRepository.findOverlappingBookings(
                        roomId, LocalDateTime.now().minusDays(30), LocalDateTime.now().plusDays(30));
                
                BookingEntity booking = roomBookings.stream()
                        .filter(b -> b.getStatus() == BookingStatusEntity.CHECKED_IN || b.getStatus() == BookingStatusEntity.CONFIRMED)
                        .findFirst()
                        .orElse(null);
                
                if (booking != null) {
                    booking.setStatus(BookingStatusEntity.CANCELLED); // Or mark completed
                    bookingRepository.save(booking);

                    String customerEmail = booking.getUser().getEmail();
                    String subject = "Hóa đơn thanh toán phòng - Hotelify";
                    StringBuilder servicesList = new StringBuilder();
                    for (InvoiceDetailEntity det : savedInvoice.getDetails()) {
                        servicesList.append(String.format("- Phòng P.%s (%s): %d ngày, Phụ thu: %,.0f%%, Hệ số: %s, Tiền dịch vụ: %,.0f đ, Thành tiền: %,.0f đ\n",
                                det.getRoom().getRoomNumber(),
                                det.getRoomTypeName(),
                                det.getTotalDays(),
                                det.getSurchargeRatioApplied().multiply(BigDecimal.valueOf(100)),
                                det.getCoefficientApplied(),
                                det.getServiceCharge(),
                                det.getSubTotal()
                        ));
                    }
                    String body = String.format(
                            "Xin chào %s,\n\n" +
                            "Hóa đơn thanh toán của bạn tại Hotelify đã được hoàn tất.\n\n" +
                            "Chi tiết hóa đơn:\n" +
                            "- Tên đơn vị: %s\n" +
                            "- Địa chỉ: %s\n" +
                            "- Phương thức thanh toán: %s\n" +
                            "- Chi tiết các phòng:\n%s" +
                            "- Tổng tiền thanh toán: %,.0f đ\n\n" +
                            "Cảm ơn quý khách đã tin tưởng lựa chọn và sử dụng dịch vụ của Hotelify!\n",
                            booking.getUser().getUsername(),
                            savedInvoice.getCustomerOrgName() != null && !savedInvoice.getCustomerOrgName().isEmpty() ? savedInvoice.getCustomerOrgName() : "Khách cá nhân",
                            savedInvoice.getAddress() != null && !savedInvoice.getAddress().isEmpty() ? savedInvoice.getAddress() : "N/A",
                            savedInvoice.getPaymentMethod(),
                            servicesList.toString(),
                            savedInvoice.getTotalAmount()
                    );
                    emailService.sendEmail(customerEmail, subject, body);
                    break; 
                }
            }
        } catch (Exception e) {
            // Ignore email errors to prevent rollback
        }

        return savedInvoice;
    }
}
