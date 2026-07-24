package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.CreateReviewRequest;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ReviewEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.RoomTypeEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.UserEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.ReviewRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.RoomTypeRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReviewService Unit Tests")
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private UserRepository userRepository;
    @Mock private RoomTypeRepository roomTypeRepository;

    private ReviewService reviewService;

    private final UUID ROOM_TYPE_ID = UUID.randomUUID();
    private final String USERNAME = "testuser";

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, userRepository, roomTypeRepository);
    }

    @Test
    @DisplayName("Tạo đánh giá thành công")
    void createReview_success() {
        UserEntity user = UserEntity.builder().username(USERNAME).build();
        RoomTypeEntity roomType = RoomTypeEntity.builder().id(ROOM_TYPE_ID).build();
        CreateReviewRequest request = new CreateReviewRequest(ROOM_TYPE_ID, 5, "Phòng rất đẹp");

        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.of(user));
        when(roomTypeRepository.findById(ROOM_TYPE_ID)).thenReturn(Optional.of(roomType));
        when(reviewRepository.save(any(ReviewEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReviewEntity saved = reviewService.createReview(request, USERNAME);

        assertThat(saved).isNotNull();
        assertThat(saved.getRating()).isEqualTo(5);
        assertThat(saved.getComment()).isEqualTo("Phòng rất đẹp");
        assertThat(saved.getUser().getUsername()).isEqualTo(USERNAME);

        verify(reviewRepository, times(1)).save(any(ReviewEntity.class));
    }

    @Test
    @DisplayName("Ném ngoại lệ khi không tìm thấy người dùng")
    void createReview_userNotFound_throwsException() {
        CreateReviewRequest request = new CreateReviewRequest(ROOM_TYPE_ID, 5, "Comment");

        when(userRepository.findByUsername(USERNAME)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(request, USERNAME))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Không tìm thấy người dùng");
    }

    @Test
    @DisplayName("Lấy danh sách đánh giá theo loại phòng")
    void getReviewsForRoomType_success() {
        ReviewEntity review = ReviewEntity.builder().comment("Tuyệt vời").rating(4).build();
        when(reviewRepository.findByRoomType_IdOrderByCreatedAtDesc(ROOM_TYPE_ID)).thenReturn(List.of(review));

        List<ReviewEntity> results = reviewService.getReviewsForRoomType(ROOM_TYPE_ID);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getComment()).isEqualTo("Tuyệt vời");
        verify(reviewRepository, times(1)).findByRoomType_IdOrderByCreatedAtDesc(ROOM_TYPE_ID);
    }
}
