package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.CreateReviewRequest;
import com.hotel.booking.infrastructure.adapter.in.web.dto.ReviewResponse;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ReviewEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomTypeEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.ReviewRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomTypeRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RoomTypeRepository roomTypeRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         UserRepository userRepository,
                         RoomTypeRepository roomTypeRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.roomTypeRepository = roomTypeRepository;
    }

    @Transactional
    public ReviewEntity createReview(CreateReviewRequest request, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng: " + username));

        RoomTypeEntity roomType = roomTypeRepository.findById(request.roomTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Loại phòng không tồn tại: " + request.roomTypeId()));

        ReviewEntity review = ReviewEntity.builder()
                .user(user)
                .roomType(roomType)
                .rating(request.rating())
                .comment(request.comment())
                .createdAt(LocalDateTime.now())
                .build();

        return reviewRepository.save(review);
    }

    public List<ReviewEntity> getReviewsForRoomType(UUID roomTypeId) {
        return reviewRepository.findByRoomType_IdOrderByCreatedAtDesc(roomTypeId);
    }
}
