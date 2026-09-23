package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.CreateBookingRequest;
import com.hotel.booking.infrastructure.adapter.in.web.dto.RoomSearchResponse;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.*;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.BookingRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.SystemParameterRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final SystemParameterRepository systemParameterRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final RedissonClient redissonClient;

    public BookingService(BookingRepository bookingRepository,
                          RoomRepository roomRepository,
                          SystemParameterRepository systemParameterRepository,
                          UserRepository userRepository,
                          EmailService emailService,
                          RedissonClient redissonClient) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.systemParameterRepository = systemParameterRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.redissonClient = redissonClient;
    }

    public List<RoomSearchResponse> searchAvailableRooms(LocalDateTime checkIn, LocalDateTime checkOut) {
        List<UUID> bookedRoomIds = bookingRepository.findBookedRoomIds(checkIn, checkOut);
        List<RoomEntity> allRooms = roomRepository.findAll();
        
        boolean overlapsNow = checkIn.isBefore(LocalDateTime.now()) && checkOut.isAfter(LocalDateTime.now());
        
        return allRooms.stream()
                .filter(r -> !bookedRoomIds.contains(r.getId()))
                .filter(r -> !overlapsNow || r.getStatus() == RoomStatusEntity.AVAILABLE)
                .map(r -> new RoomSearchResponse(
                        r.getId(),
                        r.getRoomNumber(),
                        r.getRoomType().getTypeName(),
                        r.getRoomType().getBasePrice(),
                        r.getStatus().name(),
                        r.getNote()
                ))
                .toList();
    }

    @Transactional
    public BookingEntity createBooking(CreateBookingRequest request, String username) {
        RLock lock = redissonClient.getLock("lock:booking:room:" + request.roomId());
        boolean isLocked = false;
        try {
            isLocked = lock.tryLock(5, 15, TimeUnit.SECONDS);
            if (!isLocked) {
                throw new IllegalStateException("Phòng đang được xử lý đặt bởi người dùng khác. Vui lòng thử lại sau giây lát.");
            }

            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + username));

            RoomEntity room = roomRepository.findById(request.roomId())
                    .orElseThrow(() -> new IllegalArgumentException("Phòng không tồn tại: " + request.roomId()));

            // Check overlapping bookings
            List<BookingEntity> overlaps = bookingRepository.findOverlappingBookings(
                    request.roomId(), request.checkInDate(), request.checkOutDate());
            if (!overlaps.isEmpty()) {
                throw new IllegalStateException("Phòng " + room.getRoomNumber() + " đã bị đặt trong khoảng thời gian này.");
            }

            int maxGuests = systemParameterRepository.findByParamKey("MAX_GUESTS_PER_ROOM")
                    .map(p -> p.getParamValue().intValue())
                    .orElse(3);

            if (request.guests() == null || request.guests().isEmpty()) {
                throw new IllegalArgumentException("Danh sách khách lưu trú không được để trống.");
            }
            if (request.guests().size() > maxGuests) {
                throw new IllegalArgumentException("Số lượng khách vượt quá quy định: tối đa " + maxGuests + " khách/phòng.");
            }

            // Calculate estimated price
            long days = Duration.between(request.checkInDate(), request.checkOutDate()).toDays();
            if (days <= 0) days = 1;

            BigDecimal surchargeRate = systemParameterRepository.findByParamKey("SURCHARGE_RATIO_3RD_GUEST")
                    .map(SystemParameterEntity::getParamValue)
                    .orElse(new BigDecimal("0.25"));

            BigDecimal foreignCoefficient = systemParameterRepository.findByParamKey("FOREIGN_GUEST_COEFFICIENT")
                    .map(SystemParameterEntity::getParamValue)
                    .orElse(new BigDecimal("1.50"));

            BigDecimal basePrice = room.getRoomType().getBasePrice();
            boolean hasForeign = request.guests().stream()
                    .anyMatch(g -> "FOREIGN".equalsIgnoreCase(g.customerType()));

            BigDecimal actualSurchargeRatio = request.guests().size() >= 3 ? surchargeRate : BigDecimal.ZERO;
            BigDecimal actualCoefficient = hasForeign ? foreignCoefficient : BigDecimal.ONE;

            BigDecimal estimatedPrice = BigDecimal.valueOf(days)
                    .multiply(basePrice)
                    .multiply(BigDecimal.ONE.add(actualSurchargeRatio))
                    .multiply(actualCoefficient)
                    .setScale(2, RoundingMode.HALF_UP);

            BookingEntity booking = BookingEntity.builder()
                    .room(room)
                    .user(user)
                    .checkInDate(request.checkInDate())
                    .checkOutDate(request.checkOutDate())
                    .status(BookingStatusEntity.CONFIRMED)
                    .estimatedPrice(estimatedPrice)
                    .createdAt(LocalDateTime.now())
                    .build();

            List<BookingGuestEntity> guests = request.guests().stream()
                    .map(g -> BookingGuestEntity.builder()
                            .booking(booking)
                            .customerName(g.customerName())
                            .customerType(CustomerTypeEntity.valueOf(g.customerType().toUpperCase()))
                            .idCard(g.idCard())
                            .address(g.address())
                            .build())
                    .toList();

            booking.setGuests(guests);
            BookingEntity savedBooking = bookingRepository.save(booking);

            try {
                String subject = "Xác nhận đặt phòng thành công - Hotelify";
                String body = String.format(
                        "Xin chào %s,\n\n" +
                        "Đơn đặt phòng của bạn tại Hotelify đã được xác nhận thành công!\n\n" +
                        "Chi tiết đơn đặt phòng:\n" +
                        "- Số phòng: P.%s\n" +
                        "- Loại phòng: %s\n" +
                        "- Thời gian: từ %s đến %s\n" +
                        "- Tổng tiền ước tính: %,.0f đ\n\n" +
                        "Cảm ơn quý khách đã tin tưởng lựa chọn Hotelify!\n",
                        user.getUsername(),
                        room.getRoomNumber(),
                        room.getRoomType().getTypeName(),
                        savedBooking.getCheckInDate().toLocalDate().toString(),
                        savedBooking.getCheckOutDate().toLocalDate().toString(),
                        savedBooking.getEstimatedPrice()
                );
                emailService.sendEmail(user.getEmail(), subject, body);
            } catch (Exception e) {
                // Ignore email errors to ensure transactions do not roll back on mail server outage
            }

            return savedBooking;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Quá trình đặt phòng bị gián đoạn", e);
        } finally {
            if (isLocked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    public List<BookingEntity> getMyBookings(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + username));
        return bookingRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
    }

    public List<BookingEntity> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public BookingEntity updateBookingStatus(UUID id, BookingStatusEntity status) {
        BookingEntity booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt phòng: " + id));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    @Transactional
    public BookingEntity cancelMyBooking(UUID bookingId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + username));
        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt phòng: " + bookingId));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Bạn không có quyền hủy đơn đặt phòng này.");
        }
        if (booking.getStatus() == BookingStatusEntity.CHECKED_IN) {
            throw new IllegalStateException("Không thể hủy đơn đã check-in.");
        }
        if (booking.getStatus() == BookingStatusEntity.CANCELLED) {
            throw new IllegalStateException("Đơn đặt phòng đã bị hủy trước đó.");
        }

        booking.setStatus(BookingStatusEntity.CANCELLED);
        return bookingRepository.save(booking);
    }
}