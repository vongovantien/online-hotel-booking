package com.hotel.booking.infrastructure.adapter.in.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RentalRequest(
    @NotNull(message = "Mã phòng không được để trống")
    UUID roomId,

    LocalDateTime startDate,

    @NotNull(message = "Danh sách khách hàng không được để trống")
    @Size(max = 3, message = "Rooms cannot exceed 3 guests")
    @Valid
    List<CustomerDetail> customers
) {
    public record CustomerDetail(
        @NotBlank(message = "Tên khách hàng không được để trống")
        String customerName,

        @NotBlank(message = "Loại khách hàng không được để trống")
        String customerType,  // 'DOMESTIC' or 'FOREIGN'

        @NotBlank(message = "Số CMND/Passport không được để trống")
        String idCard,

        String address
    ) {}
}
