package com.hotel.booking.infrastructure.adapter.in.web;

import com.hotel.booking.infrastructure.adapter.in.web.dto.BookingResponse;
import com.hotel.booking.infrastructure.adapter.in.web.dto.CreateBookingRequest;
import com.hotel.booking.infrastructure.adapter.in.web.dto.RoomSearchResponse;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.BookingEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.BookingStatusEntity;
import com.hotel.booking.usecase.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Booking Operations", description = "Quản lý luồng đặt phòng trực tuyến theo khoảng ngày")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/rooms/available")
    @Operation(summary = "Tìm phòng trống theo khoảng thời gian")
    public ResponseEntity<List<RoomSearchResponse>> searchAvailableRooms(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        
        // Standard hotel check-in at 14:00 and check-out at 12:00
        LocalDateTime checkInTime = checkIn.atTime(LocalTime.of(14, 0));
        LocalDateTime checkOutTime = checkOut.atTime(LocalTime.of(12, 0));
        
        return ResponseEntity.ok(bookingService.searchAvailableRooms(checkInTime, checkOutTime));
    }

    @PostMapping("/bookings")
    @Operation(summary = "Tạo đơn đặt phòng")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            Principal principal) {
        BookingEntity booking = bookingService.createBooking(request, principal.getName());
        return ResponseEntity.ok(mapToBookingResponse(booking));
    }

    @GetMapping("/bookings/my")
    @Operation(summary = "Danh sách đặt phòng của tôi")
    public ResponseEntity<List<BookingResponse>> getMyBookings(Principal principal) {
        List<BookingEntity> bookings = bookingService.getMyBookings(principal.getName());
        return ResponseEntity.ok(bookings.stream().map(this::mapToBookingResponse).toList());
    }

    @GetMapping("/bookings")
    @Operation(summary = "Xem tất cả đặt phòng (Lễ tân/Admin)")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingEntity> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings.stream().map(this::mapToBookingResponse).toList());
    }

    @PutMapping("/bookings/{id}/status")
    @Operation(summary = "Cập nhật trạng thái đơn đặt phòng (Lễ tân/Admin)")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable UUID id,
            @RequestParam BookingStatusEntity status) {
        BookingEntity booking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(mapToBookingResponse(booking));
    }

    @PutMapping("/bookings/{id}/cancel")
    @Operation(summary = "Khách hàng hủy đơn đặt phòng của mình")
    public ResponseEntity<BookingResponse> cancelMyBooking(
            @PathVariable UUID id,
            Principal principal) {
        BookingEntity booking = bookingService.cancelMyBooking(id, principal.getName());
        return ResponseEntity.ok(mapToBookingResponse(booking));
    }

    private BookingResponse mapToBookingResponse(BookingEntity booking) {
        List<BookingResponse.BookingGuestResponse> guestResponses = booking.getGuests().stream()
                .map(g -> new BookingResponse.BookingGuestResponse(
                        g.getId(),
                        g.getCustomerName(),
                        g.getCustomerType().name(),
                        g.getIdCard(),
                        g.getAddress()
                )).toList();

        return new BookingResponse(
                booking.getId(),
                booking.getRoom().getId(),
                booking.getRoom().getRoomNumber(),
                booking.getRoom().getRoomType().getTypeName(),
                booking.getCheckInDate(),
                booking.getCheckOutDate(),
                booking.getStatus().name(),
                booking.getEstimatedPrice(),
                booking.getCreatedAt(),
                guestResponses
        );
    }
}
