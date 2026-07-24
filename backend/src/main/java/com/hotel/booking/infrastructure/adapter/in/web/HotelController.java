package com.hotel.booking.infrastructure.adapter.in.web;

import com.hotel.booking.infrastructure.adapter.in.web.dto.*;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.InvoiceEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RentalSlipEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomTypeEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.SystemParameterEntity;
import com.hotel.booking.usecase.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Hotel Operations", description = "Quản lý phòng, phiếu thuê, hóa đơn và báo cáo")
public class HotelController {

    private final RoomService roomService;
    private final RentalService rentalService;
    private final InvoiceService invoiceService;
    private final ReportService reportService;
    private final ParameterService parameterService;

    public HotelController(RoomService roomService,
                           RentalService rentalService,
                           InvoiceService invoiceService,
                           ReportService reportService,
                           ParameterService parameterService) {
        this.roomService = roomService;
        this.rentalService = rentalService;
        this.invoiceService = invoiceService;
        this.reportService = reportService;
        this.parameterService = parameterService;
    }

    // =========================================================================
    // BM3: Tra cứu phòng (Mọi đối tượng đều truy cập được)
    // =========================================================================

    @GetMapping("/rooms")
    @Operation(summary = "BM3 — Tra cứu phòng",
               description = "Xem danh sách phòng với bộ lọc tùy chọn. Tất cả roles đều truy cập được.")
    @ApiResponse(responseCode = "200", description = "Danh sách phòng")
    public ResponseEntity<List<RoomSearchResponse>> searchRooms(
            @Parameter(description = "Lọc theo loại: A, B, C") @RequestParam(required = false) String type,
            @Parameter(description = "Lọc theo trạng thái: AVAILABLE, RENTED, MAINTENANCE")
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(roomService.searchRooms(type, status));
    }

    @PostMapping("/rooms")
    @Operation(summary = "Thêm phòng mới", description = "Dành cho Admin hoặc Lễ tân tạo mới phòng")
    public ResponseEntity<RoomSearchResponse> createRoom(@Valid @RequestBody CreateOrUpdateRoomRequest req) {
        return ResponseEntity.ok(roomService.createRoom(req));
    }

    @PutMapping("/rooms/{id}")
    @Operation(summary = "Cập nhật thông tin phòng", description = "Cập nhật số phòng, loại phòng, trạng thái hoặc ghi chú")
    public ResponseEntity<RoomSearchResponse> updateRoom(@PathVariable UUID id, @Valid @RequestBody CreateOrUpdateRoomRequest req) {
        return ResponseEntity.ok(roomService.updateRoom(id, req));
    }

    @DeleteMapping("/rooms/{id}")
    @Operation(summary = "Xóa phòng", description = "Xóa phòng (không được xóa phòng đang có khách thuê)")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    // =========================================================================
    // BM2 & QĐ2: Lập phiếu thuê phòng (Lễ tân, Quản trị viên)
    // =========================================================================

    @PostMapping("/rentals")
    @Operation(summary = "BM2 — Lập phiếu thuê phòng (Check-in)",
               description = """
                   Tối đa 3 khách/phòng (QĐ2). Phòng phải ở trạng thái AVAILABLE.
                   Sau khi tạo phiếu, phòng chuyển sang RENTED tự động.
                   **Role:** RECEPTIONIST, ADMIN
                   """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Phiếu thuê tạo thành công"),
        @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ / số khách vượt quá giới hạn"),
        @ApiResponse(responseCode = "409", description = "Phòng đang được thuê hoặc bảo trì")
    })
    public ResponseEntity<RentalSlipResponse> createRental(@Valid @RequestBody RentalRequest request) {
        RentalSlipEntity rental = rentalService.createRental(request);
        return ResponseEntity.ok(mapToRentalSlipResponse(rental));
    }

    @GetMapping("/rooms/{roomId}/active-rental")
    @Operation(summary = "Lấy phiếu thuê phòng hoạt động của phòng")
    public ResponseEntity<RentalSlipResponse> getActiveRentalByRoom(@PathVariable UUID roomId) {
        RentalSlipEntity rental = rentalService.findActiveRentalByRoomId(roomId);
        if (rental == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapToRentalSlipResponse(rental));
    }

    // =========================================================================
    // BM4 & QĐ4: Lập hóa đơn thanh toán (Lễ tân, Quản trị viên)
    // =========================================================================

    @PostMapping("/invoices/checkout")
    @Operation(summary = "BM4 — Lập hóa đơn thanh toán (Check-out)",
               description = """
                   **Công thức QĐ4:**
                   `Thành tiền = Số ngày × Đơn giá × (1 + phụ thu) × hệ số nước ngoài`

                   - Phụ thu **25%** nếu phòng có đúng 3 khách
                   - Hệ số **1.5** nếu có ít nhất 1 khách nước ngoài
                   - Lưu **snapshot** — thay đổi giá sau không ảnh hưởng hóa đơn này (QĐ6)
                   - Dùng Redisson distributed lock ngăn 2 nhân viên checkout cùng phòng

                   **Role:** RECEPTIONIST, ADMIN
                   """)
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Hóa đơn tạo thành công"),
        @ApiResponse(responseCode = "400", description = "Không tìm thấy phiếu thuê hoạt động"),
        @ApiResponse(responseCode = "422", description = "Phòng đang được xử lý bởi nhân viên khác")
    })
    public ResponseEntity<InvoiceResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        InvoiceEntity invoice = invoiceService.processCheckout(request);
        return ResponseEntity.ok(mapToInvoiceResponse(invoice));
    }

    // =========================================================================
    // BM5.1: Báo cáo doanh thu theo loại phòng (Quản trị viên)
    // =========================================================================

    @GetMapping("/reports/revenue")
    @Operation(summary = "BM5.1 — Báo cáo doanh thu theo loại phòng", description = "**Role:** ADMIN only")
    public ResponseEntity<List<RevenueReportItem>> revenueReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyRevenueReport(year, month));
    }

    // =========================================================================
    // BM5.2: Báo cáo mật độ sử dụng phòng (Quản trị viên)
    // =========================================================================

    @GetMapping("/reports/utilization")
    @Operation(summary = "BM5.2 — Báo cáo mật độ sử dụng phòng", description = "**Role:** ADMIN only")
    public ResponseEntity<List<UtilizationReportItem>> utilizationReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyUtilizationReport(year, month));
    }

    // =========================================================================
    // QĐ6: Cấu hình tham số hệ thống (Quản trị viên)
    // =========================================================================

    @GetMapping("/parameters")
    @Operation(summary = "QĐ6 — Xem tham số cấu hình hệ thống", description = "**Role:** ADMIN only")
    public ResponseEntity<List<SystemParameterEntity>> getParameters() {
        return ResponseEntity.ok(parameterService.getAllParameters());
    }

    @PutMapping("/parameters")
    @Operation(summary = "QĐ6 — Cập nhật tham số hệ thống",
               description = "Keys: `MAX_GUESTS_PER_ROOM`, `SURCHARGE_RATIO_3RD_GUEST`, `FOREIGN_GUEST_COEFFICIENT`. **Role:** ADMIN only")
    public ResponseEntity<SystemParameterEntity> updateParameter(@Valid @RequestBody UpdateParameterRequest request) {
        SystemParameterEntity param = parameterService.updateParameter(request.paramKey(), request.paramValue());
        return ResponseEntity.ok(param);
    }

    @GetMapping("/room-types")
    @Operation(summary = "QĐ6 — Danh sách loại phòng và đơn giá", description = "**Role:** ADMIN only")
    public ResponseEntity<List<RoomTypeEntity>> getRoomTypes() {
        return ResponseEntity.ok(parameterService.getAllRoomTypes());
    }

    @PutMapping("/room-types/{id}")
    @Operation(summary = "QĐ6 — Cập nhật đơn giá loại phòng", description = "**Role:** ADMIN only")
    public ResponseEntity<RoomTypeEntity> updateRoomTypePrice(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoomTypeRequest request) {
        RoomTypeEntity type = parameterService.updateRoomTypePrice(id, request.basePrice());
        return ResponseEntity.ok(type);
    }

    // =========================================================================
    // Mappings
    // =========================================================================

    private RentalSlipResponse mapToRentalSlipResponse(RentalSlipEntity rental) {
        RoomSearchResponse roomResponse = new RoomSearchResponse(
                rental.getRoom().getId(),
                rental.getRoom().getRoomNumber(),
                rental.getRoom().getRoomType().getTypeName(),
                rental.getRoom().getRoomType().getBasePrice(),
                rental.getRoom().getStatus().name(),
                rental.getRoom().getNote()
        );

        List<RentalSlipResponse.CustomerDetailResponse> customerResponses = rental.getDetails().stream()
                .map(d -> new RentalSlipResponse.CustomerDetailResponse(
                        d.getId(),
                        d.getCustomerName(),
                        d.getCustomerType().name(),
                        d.getIdCard(),
                        d.getAddress()
                )).toList();

        return new RentalSlipResponse(
                rental.getId(),
                roomResponse,
                rental.getStartDate(),
                rental.getStatus().name(),
                rental.getCreatedAt(),
                customerResponses
        );
    }

    private InvoiceResponse mapToInvoiceResponse(InvoiceEntity invoice) {
        List<InvoiceResponse.InvoiceDetailResponse> detailResponses = invoice.getDetails().stream()
                .map(d -> new InvoiceResponse.InvoiceDetailResponse(
                        d.getId(),
                        d.getRoom().getId(),
                        d.getRoom().getRoomNumber(),
                        d.getRoomTypeName(),
                        d.getTotalDays(),
                        d.getBasePriceSnapshot(),
                        d.getSurchargeRatioApplied(),
                        d.getCoefficientApplied(),
                        d.getServiceCharge(),
                        d.getSubTotal()
                )).toList();

        return new InvoiceResponse(
                invoice.getId(),
                invoice.getCustomerOrgName(),
                invoice.getAddress(),
                invoice.getTotalAmount(),
                invoice.getPaymentDate(),
                invoice.getPaymentMethod(),
                detailResponses
        );
    }
}
