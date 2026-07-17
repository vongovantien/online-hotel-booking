package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomTypeEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.SystemParameterEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomTypeRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.SystemParameterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ParameterService {

    private final SystemParameterRepository systemParameterRepository;
    private final RoomTypeRepository roomTypeRepository;

    public ParameterService(SystemParameterRepository systemParameterRepository,
                            RoomTypeRepository roomTypeRepository) {
        this.systemParameterRepository = systemParameterRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    public List<SystemParameterEntity> getAllParameters() {
        return systemParameterRepository.findAll();
    }

    @Transactional
    public SystemParameterEntity updateParameter(String key, BigDecimal value) {
        SystemParameterEntity param = systemParameterRepository.findByParamKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tham số cấu hình: " + key));
        param.setParamValue(value);
        param.setUpdatedAt(LocalDateTime.now());
        return systemParameterRepository.save(param);
    }

    public List<RoomTypeEntity> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    @Transactional
    public RoomTypeEntity updateRoomTypePrice(UUID typeId, BigDecimal newPrice) {
        RoomTypeEntity type = roomTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy loại phòng: " + typeId));
        type.setBasePrice(newPrice);
        return roomTypeRepository.save(type);
    }
}
