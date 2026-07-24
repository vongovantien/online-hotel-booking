package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RentalSlipEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RentalSlipServiceEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ServiceEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RentalSlipRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RentalSlipServiceRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final RentalSlipServiceRepository rentalSlipServiceRepository;
    private final RentalSlipRepository rentalSlipRepository;

    public ServiceService(ServiceRepository serviceRepository,
                          RentalSlipServiceRepository rentalSlipServiceRepository,
                          RentalSlipRepository rentalSlipRepository) {
        this.serviceRepository = serviceRepository;
        this.rentalSlipServiceRepository = rentalSlipServiceRepository;
        this.rentalSlipRepository = rentalSlipRepository;
    }

    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    public ServiceEntity createService(ServiceEntity service) {
        return serviceRepository.save(service);
    }

    public ServiceEntity updateService(UUID id, ServiceEntity request) {
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Dịch vụ không tồn tại: " + id));
        service.setServiceName(request.getServiceName());
        service.setPrice(request.getPrice());
        service.setUnit(request.getUnit());
        return serviceRepository.save(service);
    }

    public void deleteService(UUID id) {
        serviceRepository.deleteById(id);
    }

    @Transactional
    public RentalSlipServiceEntity addServiceToRental(UUID rentalSlipId, UUID serviceId, int quantity) {
        RentalSlipEntity rentalSlip = rentalSlipRepository.findById(rentalSlipId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu thuê: " + rentalSlipId));

        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dịch vụ: " + serviceId));

        RentalSlipServiceEntity rentalService = RentalSlipServiceEntity.builder()
                .rentalSlip(rentalSlip)
                .service(service)
                .quantity(quantity)
                .priceSnapshot(service.getPrice())
                .createdAt(LocalDateTime.now())
                .build();

        return rentalSlipServiceRepository.save(rentalService);
    }

    public List<RentalSlipServiceEntity> getServicesForRental(UUID rentalSlipId) {
        return rentalSlipServiceRepository.findByRentalSlip_Id(rentalSlipId);
    }
}
