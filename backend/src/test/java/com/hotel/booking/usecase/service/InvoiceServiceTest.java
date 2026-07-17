package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.CheckoutRequest;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.*;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests cho InvoiceService — tập trung vào thuật toán tính tiền QĐ4.
 *
 * Công thức:
 *   Thành tiền = Số ngày × Đơn giá × (1 + phụ thu) × hệ số nước ngoài
 *   - Phụ thu = 0.25 nếu số khách >= 3, ngược lại = 0
 *   - Hệ số = 1.50 nếu có ít nhất 1 FOREIGN, ngược lại = 1.0
 */
@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock private RentalSlipRepository rentalSlipRepository;
    @Mock private RoomRepository roomRepository;
    @Mock private SystemParameterRepository systemParameterRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private RedissonClient redissonClient;
    @Mock private RLock lock;

    private InvoiceService invoiceService;

    private static final UUID ROOM_ID    = UUID.randomUUID();
    private static final UUID ROOM_TYPE_ID = UUID.randomUUID();
    private static final BigDecimal BASE_PRICE = new BigDecimal("150000");

    @BeforeEach
    void setUp() {
        invoiceService = new InvoiceService(
                rentalSlipRepository, roomRepository,
                systemParameterRepository, invoiceRepository, redissonClient);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private SystemParameterEntity param(String key, String value) {
        return SystemParameterEntity.builder()
                .paramKey(key).paramValue(new BigDecimal(value))
                .description("").updatedAt(LocalDateTime.now()).build();
    }

    private RentalSlipEntity rentalSlip(int daysAgo, List<RentalSlipDetailEntity> guests) {
        RoomTypeEntity roomType = RoomTypeEntity.builder()
                .id(ROOM_TYPE_ID).typeName("A")
                .basePrice(BASE_PRICE).description("Loại A").build();

        RoomEntity room = RoomEntity.builder()
                .id(ROOM_ID).roomNumber("101").roomType(roomType)
                .status(RoomStatusEntity.RENTED).build();

        RentalSlipEntity slip = RentalSlipEntity.builder()
                .id(UUID.randomUUID()).room(room)
                .startDate(LocalDateTime.now().minusDays(daysAgo))
                .status(RentalSlipStatusEntity.ACTIVE)
                .createdAt(LocalDateTime.now().minusDays(daysAgo))
                .build();

        guests.forEach(g -> g.setRentalSlip(slip));
        slip.setDetails(guests);
        return slip;
    }

    private RentalSlipDetailEntity guest(String name, CustomerTypeEntity type) {
        return RentalSlipDetailEntity.builder()
                .id(UUID.randomUUID()).customerName(name)
                .customerType(type).idCard("123456").address("HCM").build();
    }

    private void mockSystemParams() {
        when(systemParameterRepository.findByParamKey("SURCHARGE_RATIO_3RD_GUEST"))
                .thenReturn(Optional.of(param("SURCHARGE_RATIO_3RD_GUEST", "0.25")));
        when(systemParameterRepository.findByParamKey("FOREIGN_GUEST_COEFFICIENT"))
                .thenReturn(Optional.of(param("FOREIGN_GUEST_COEFFICIENT", "1.50")));
    }

    private void mockLock() throws InterruptedException {
        when(redissonClient.getLock(anyString())).thenReturn(lock);
        when(lock.tryLock(0, 30, TimeUnit.SECONDS)).thenReturn(true);
        when(lock.isHeldByCurrentThread()).thenReturn(true);
    }

    private void mockInvoiceSave() {
        when(invoiceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    // =========================================================================
    // Test cases QĐ4
    // =========================================================================

    @Nested
    @DisplayName("QĐ4 — Tính tiền phòng")
    class PricingTests {

        @Test
        @DisplayName("1 khách DOMESTIC, 3 ngày — không phụ thu, không hệ số nước ngoài")
        void checkout_1DomesticGuest_3Days_noSurcharge_noForeign() throws Exception {
            mockSystemParams();
            mockLock();
            mockInvoiceSave();

            List<RentalSlipDetailEntity> guests = List.of(guest("Nguyen Van A", CustomerTypeEntity.DOMESTIC));
            RentalSlipEntity slip = rentalSlip(3, guests);

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of(slip));

            CheckoutRequest req = new CheckoutRequest("Công ty ABC", "HCM", List.of(ROOM_ID));
            InvoiceEntity result = invoiceService.processCheckout(req);

            // 3 ngày × 150,000 × (1 + 0) × 1.0 = 450,000
            assertThat(result.getTotalAmount())
                    .isEqualByComparingTo(new BigDecimal("450000.00"));
            assertThat(result.getDetails()).hasSize(1);
            assertThat(result.getDetails().get(0).getSurchargeRatioApplied())
                    .isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(result.getDetails().get(0).getCoefficientApplied())
                    .isEqualByComparingTo(BigDecimal.ONE);
        }

        @Test
        @DisplayName("2 khách DOMESTIC, 2 ngày — không phụ thu, không hệ số nước ngoài")
        void checkout_2DomesticGuests_2Days_noSurcharge() throws Exception {
            mockSystemParams();
            mockLock();
            mockInvoiceSave();

            List<RentalSlipDetailEntity> guests = List.of(
                    guest("A", CustomerTypeEntity.DOMESTIC),
                    guest("B", CustomerTypeEntity.DOMESTIC));
            RentalSlipEntity slip = rentalSlip(2, guests);

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of(slip));

            InvoiceEntity result = invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID)));

            // 2 ngày × 150,000 × 1.0 × 1.0 = 300,000
            assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("300000.00"));
        }

        @Test
        @DisplayName("3 khách DOMESTIC, 2 ngày — phụ thu 25%, không hệ số nước ngoài")
        void checkout_3DomesticGuests_2Days_surcharge25Percent() throws Exception {
            mockSystemParams();
            mockLock();
            mockInvoiceSave();

            List<RentalSlipDetailEntity> guests = List.of(
                    guest("A", CustomerTypeEntity.DOMESTIC),
                    guest("B", CustomerTypeEntity.DOMESTIC),
                    guest("C", CustomerTypeEntity.DOMESTIC));
            RentalSlipEntity slip = rentalSlip(2, guests);

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of(slip));

            InvoiceEntity result = invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID)));

            // 2 ngày × 150,000 × 1.25 × 1.0 = 375,000
            assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("375000.00"));
            assertThat(result.getDetails().get(0).getSurchargeRatioApplied())
                    .isEqualByComparingTo(new BigDecimal("0.25"));
        }

        @Test
        @DisplayName("1 khách FOREIGN, 2 ngày — không phụ thu, hệ số 1.5")
        void checkout_1ForeignGuest_2Days_foreignCoefficient() throws Exception {
            mockSystemParams();
            mockLock();
            mockInvoiceSave();

            List<RentalSlipDetailEntity> guests = List.of(guest("John", CustomerTypeEntity.FOREIGN));
            RentalSlipEntity slip = rentalSlip(2, guests);

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of(slip));

            InvoiceEntity result = invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID)));

            // 2 ngày × 150,000 × 1.0 × 1.5 = 450,000
            assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("450000.00"));
            assertThat(result.getDetails().get(0).getCoefficientApplied())
                    .isEqualByComparingTo(new BigDecimal("1.50"));
        }

        @Test
        @DisplayName("3 khách, 1 trong số đó FOREIGN, 2 ngày — phụ thu 25% + hệ số 1.5")
        void checkout_3Guests_1Foreign_2Days_bothSurchargeAndForeign() throws Exception {
            mockSystemParams();
            mockLock();
            mockInvoiceSave();

            // 2 DOMESTIC + 1 FOREIGN = 3 khách, có ngoại quốc
            List<RentalSlipDetailEntity> guests = List.of(
                    guest("A", CustomerTypeEntity.DOMESTIC),
                    guest("B", CustomerTypeEntity.DOMESTIC),
                    guest("C", CustomerTypeEntity.FOREIGN));
            RentalSlipEntity slip = rentalSlip(2, guests);

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of(slip));

            InvoiceEntity result = invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID)));

            // 2 ngày × 150,000 × 1.25 × 1.5 = 562,500
            assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("562500.00"));
            assertThat(result.getDetails().get(0).getSurchargeRatioApplied())
                    .isEqualByComparingTo(new BigDecimal("0.25"));
            assertThat(result.getDetails().get(0).getCoefficientApplied())
                    .isEqualByComparingTo(new BigDecimal("1.50"));
        }

        @Test
        @DisplayName("Số ngày thuê = 0 (check-in hôm nay) → tính tối thiểu 1 ngày")
        void checkout_sameDayCheckout_countsAs1Day() throws Exception {
            mockSystemParams();
            mockLock();
            mockInvoiceSave();

            List<RentalSlipDetailEntity> guests = List.of(guest("A", CustomerTypeEntity.DOMESTIC));
            // Check-in 10 phút trước
            RentalSlipEntity slip = rentalSlip(0, guests);
            slip.setStartDate(LocalDateTime.now().minusMinutes(10));

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of(slip));

            InvoiceEntity result = invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID)));

            // 1 ngày tối thiểu × 150,000 = 150,000
            assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("150000.00"));
        }
    }

    // =========================================================================
    // Validation tests
    // =========================================================================

    @Nested
    @DisplayName("Validation — checkout errors")
    class ValidationTests {

        @Test
        @DisplayName("Throws khi không tìm thấy phiếu thuê ACTIVE cho phòng")
        void checkout_noActiveRental_throwsIllegalArgument() throws Exception {
            mockSystemParams();
            mockLock();

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of()); // không có phiếu

            assertThatThrownBy(() -> invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID))))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining(ROOM_ID.toString());
        }

        @Test
        @DisplayName("Throws khi không thể acquire distributed lock (phòng đang được xử lý)")
        void checkout_cannotAcquireLock_throwsIllegalState() throws InterruptedException {
            mockSystemParams();
            when(redissonClient.getLock(anyString())).thenReturn(lock);
            when(lock.tryLock(0, 30, TimeUnit.SECONDS)).thenReturn(false); // lock không acquired

            assertThatThrownBy(() -> invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID))))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("đang được xử lý");
        }
    }

    // =========================================================================
    // System parameter fallback tests
    // =========================================================================

    @Nested
    @DisplayName("System parameter — fallback values khi DB trống")
    class ParameterFallbackTests {

        @Test
        @DisplayName("Dùng giá trị mặc định 0.25 và 1.5 khi không tìm thấy trong DB")
        void checkout_missingParams_usesDefaults() throws Exception {
            // No system params in DB
            when(systemParameterRepository.findByParamKey(anyString())).thenReturn(Optional.empty());
            mockLock();
            mockInvoiceSave();

            List<RentalSlipDetailEntity> guests = List.of(
                    guest("A", CustomerTypeEntity.DOMESTIC),
                    guest("B", CustomerTypeEntity.DOMESTIC),
                    guest("C", CustomerTypeEntity.FOREIGN));
            RentalSlipEntity slip = rentalSlip(2, guests);

            when(rentalSlipRepository.findByRoom_IdAndStatus(ROOM_ID, RentalSlipStatusEntity.ACTIVE))
                    .thenReturn(List.of(slip));

            InvoiceEntity result = invoiceService.processCheckout(
                    new CheckoutRequest("Test", "HN", List.of(ROOM_ID)));

            // Fallback: 2 × 150,000 × 1.25 × 1.5 = 562,500 (same as explicit params)
            assertThat(result.getTotalAmount()).isEqualByComparingTo(new BigDecimal("562500.00"));
        }
    }
}
