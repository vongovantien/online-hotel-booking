package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.RevenueReportItem;
import com.hotel.booking.infrastructure.adapter.in.web.dto.UtilizationReportItem;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.InvoiceDetailEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.InvoiceDetailRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final InvoiceDetailRepository invoiceDetailRepository;

    public ReportService(InvoiceDetailRepository invoiceDetailRepository) {
        this.invoiceDetailRepository = invoiceDetailRepository;
    }

    /**
     * BM5.1: Báo cáo doanh thu theo loại phòng trong tháng (Type-Safe Java Stream).
     */
    @Transactional(readOnly = true)
    public List<RevenueReportItem> getMonthlyRevenueReport(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1).minusNanos(1);

        List<InvoiceDetailEntity> details = invoiceDetailRepository.findByInvoice_PaymentDateBetween(start, end);

        Map<String, BigDecimal> revenueMap = details.stream()
                .collect(Collectors.groupingBy(
                        InvoiceDetailEntity::getRoomTypeName,
                        Collectors.reducing(BigDecimal.ZERO, InvoiceDetailEntity::getSubTotal, BigDecimal::add)
                ));

        BigDecimal totalRevenue = revenueMap.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return revenueMap.entrySet().stream()
                .map(entry -> {
                    BigDecimal revenue = entry.getValue();
                    BigDecimal ratio = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                            ? revenue.multiply(BigDecimal.valueOf(100)).divide(totalRevenue, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return new RevenueReportItem(entry.getKey(), revenue, ratio);
                }).toList();
    }

    /**
     * BM5.2: Báo cáo mật độ sử dụng phòng trong tháng (Type-Safe Java Stream).
     */
    @Transactional(readOnly = true)
    public List<UtilizationReportItem> getMonthlyUtilizationReport(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1).minusNanos(1);

        List<InvoiceDetailEntity> details = invoiceDetailRepository.findByInvoice_PaymentDateBetween(start, end);

        // Nhóm theo phòng (RoomEntity) và tổng hợp số ngày thuê (totalDays)
        Map<RoomEntity, Integer> roomDaysMap = details.stream()
                .filter(d -> d.getRoom() != null)
                .collect(Collectors.groupingBy(
                        InvoiceDetailEntity::getRoom,
                        Collectors.summingInt(d -> d.getTotalDays() != null ? d.getTotalDays() : 0)
                ));

        long totalDaysAll = roomDaysMap.values().stream().mapToLong(Integer::longValue).sum();

        return roomDaysMap.entrySet().stream()
                .map(entry -> {
                    RoomEntity room = entry.getKey();
                    int rentedDays = entry.getValue();
                    BigDecimal ratio = totalDaysAll > 0
                            ? BigDecimal.valueOf(rentedDays * 100.0 / totalDaysAll).setScale(2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return new UtilizationReportItem(room.getId(), room.getRoomNumber(), rentedDays, ratio);
                }).toList();
    }
}
