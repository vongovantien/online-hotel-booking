package com.hotel.booking.infrastructure.adapter.in.web;

import com.hotel.booking.infrastructure.adapter.in.web.dto.AddServiceRequest;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RentalSlipServiceEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ServiceEntity;
import com.hotel.booking.usecase.service.ServiceService;
import io.swagger.v3.oas.annotations.Operation;
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
@Tag(name = "Service Operations", description = "Quản lý dịch vụ đi kèm khách sạn")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @GetMapping("/services")
    @Operation(summary = "Danh sách tất cả dịch vụ")
    public ResponseEntity<List<ServiceEntity>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @PostMapping("/services")
    @Operation(summary = "Tạo mới dịch vụ (Admin)")
    public ResponseEntity<ServiceEntity> createService(@Valid @RequestBody ServiceEntity service) {
        return ResponseEntity.ok(serviceService.createService(service));
    }

    @PutMapping("/services/{id}")
    @Operation(summary = "Cập nhật dịch vụ (Admin)")
    public ResponseEntity<ServiceEntity> updateService(@PathVariable UUID id, @Valid @RequestBody ServiceEntity service) {
        return ResponseEntity.ok(serviceService.updateService(id, service));
    }

    @DeleteMapping("/services/{id}")
    @Operation(summary = "Xóa dịch vụ (Admin)")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        serviceService.deleteService(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/rentals/{rentalSlipId}/services")
    @Operation(summary = "Ghi nhận sử dụng dịch vụ cho phòng đang thuê")
    public ResponseEntity<RentalSlipServiceEntity> addServiceToRental(
            @PathVariable UUID rentalSlipId,
            @Valid @RequestBody AddServiceRequest request) {
        RentalSlipServiceEntity entity = serviceService.addServiceToRental(
                rentalSlipId, request.serviceId(), request.quantity());
        return ResponseEntity.ok(entity);
    }

    @GetMapping("/rentals/{rentalSlipId}/services")
    @Operation(summary = "Xem danh sách dịch vụ phòng đã dùng")
    public ResponseEntity<List<RentalSlipServiceEntity>> getServicesForRental(@PathVariable UUID rentalSlipId) {
        return ResponseEntity.ok(serviceService.getServicesForRental(rentalSlipId));
    }
}
