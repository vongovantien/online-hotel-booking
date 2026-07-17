package com.hotel.booking.infrastructure.config;

import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomStatusEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomTypeEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.SystemParameterEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomTypeRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.SystemParameterRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final SystemParameterRepository systemParameterRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public DatabaseSeeder(SystemParameterRepository systemParameterRepository,
                          RoomTypeRepository roomTypeRepository,
                          RoomRepository roomRepository,
                          UserRepository userRepository) {
        this.systemParameterRepository = systemParameterRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedSystemParameters();
        seedRoomTypesAndRooms();
    }

    /**
     * Seed các tài khoản người dùng mặc định.
     */
    private void seedUsers() {
        if (userRepository.count() > 0) return;

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        userRepository.save(UserEntity.builder()
                .username("admin")
                .email("admin@hotel.com")
                .passwordHash(encoder.encode("Admin@123"))
                .role("ADMIN")
                .createdAt(LocalDateTime.now())
                .build());

        userRepository.save(UserEntity.builder()
                .username("receptionist")
                .email("receptionist@hotel.com")
                .passwordHash(encoder.encode("Receptionist@123"))
                .role("RECEPTIONIST")
                .createdAt(LocalDateTime.now())
                .build());

        userRepository.save(UserEntity.builder()
                .username("customer")
                .email("customer@hotel.com")
                .passwordHash(encoder.encode("Customer@123"))
                .role("CUSTOMER")
                .createdAt(LocalDateTime.now())
                .build());

        System.out.println("✅ Seeded default accounts: admin, receptionist, customer");
    }

    /**
     * QĐ6: Seed các tham số cấu hình hệ thống mặc định.
     */
    private void seedSystemParameters() {
        if (systemParameterRepository.count() > 0) return;

        systemParameterRepository.save(SystemParameterEntity.builder()
                .paramKey("MAX_GUESTS_PER_ROOM")
                .paramValue(new BigDecimal("3"))
                .description("Số lượng khách tối đa trong một phòng")
                .updatedAt(LocalDateTime.now())
                .build());

        systemParameterRepository.save(SystemParameterEntity.builder()
                .paramKey("SURCHARGE_RATIO_3RD_GUEST")
                .paramValue(new BigDecimal("0.25"))
                .description("Tỷ lệ phụ thu khi phòng có khách thứ 3 (25%)")
                .updatedAt(LocalDateTime.now())
                .build());

        systemParameterRepository.save(SystemParameterEntity.builder()
                .paramKey("FOREIGN_GUEST_COEFFICIENT")
                .paramValue(new BigDecimal("1.50"))
                .description("Hệ số nhân khi phòng có ít nhất 1 khách nước ngoài")
                .updatedAt(LocalDateTime.now())
                .build());

        System.out.println("✅ Seeded system parameters: MAX_GUESTS=3, SURCHARGE=0.25, FOREIGN_COEFF=1.50");
    }

    /**
     * BM1 & QĐ1: Seed danh mục loại phòng (A, B, C) và các phòng mặc định.
     */
    private void seedRoomTypesAndRooms() {
        if (roomTypeRepository.count() > 0) return;

        // Loại phòng A - 150.000đ
        RoomTypeEntity typeA = roomTypeRepository.save(RoomTypeEntity.builder()
                .typeName("A")
                .basePrice(new BigDecimal("150000"))
                .description("Phòng loại A - Tiêu chuẩn")
                .build());

        // Loại phòng B - 170.000đ
        RoomTypeEntity typeB = roomTypeRepository.save(RoomTypeEntity.builder()
                .typeName("B")
                .basePrice(new BigDecimal("170000"))
                .description("Phòng loại B - Cao cấp")
                .build());

        // Loại phòng C - 200.000đ
        RoomTypeEntity typeC = roomTypeRepository.save(RoomTypeEntity.builder()
                .typeName("C")
                .basePrice(new BigDecimal("200000"))
                .description("Phòng loại C - VIP")
                .build());

        System.out.println("✅ Seeded room types: A(150k), B(170k), C(200k)");

        // Seed 15 phòng: Tầng 1 (101-105), Tầng 2 (201-205), Tầng 3 (301-305)
        seedRoomsForFloor("1", 101, 105, typeA, typeB); // 101-103: A, 104-105: B
        seedRoomsForFloor("2", 201, 205, typeB, typeC); // 201-203: B, 204-205: C
        seedRoomsForFloor("3", 301, 305, typeC, typeA); // 301-303: C, 304-305: A

        System.out.println("✅ Seeded 15 hotel rooms across 3 floors.");
    }

    private void seedRoomsForFloor(String floor, int startNum, int endNum,
                                    RoomTypeEntity primaryType, RoomTypeEntity secondaryType) {
        for (int num = startNum; num <= endNum; num++) {
            RoomTypeEntity type = (num <= startNum + 2) ? primaryType : secondaryType;
            roomRepository.save(RoomEntity.builder()
                    .roomNumber(String.valueOf(num))
                    .roomType(type)
                    .status(RoomStatusEntity.AVAILABLE)
                    .note("Tầng " + floor + " - Phòng " + type.getTypeName())
                    .build());
        }
    }
}
