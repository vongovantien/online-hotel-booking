package com.hotel.booking.infrastructure.adapter.in.web;

import com.hotel.booking.infrastructure.adapter.in.web.dto.CreateReviewRequest;
import com.hotel.booking.infrastructure.adapter.in.web.dto.ReviewResponse;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ReviewEntity;
import com.hotel.booking.usecase.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Review Operations", description = "Quản lý đánh giá và bình luận phòng")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    @Operation(summary = "Viết đánh giá phòng mới")
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Principal principal) {
        ReviewEntity review = reviewService.createReview(request, principal.getName());
        return ResponseEntity.ok(mapToReviewResponse(review));
    }

    @GetMapping("/reviews/room-type/{roomTypeId}")
    @Operation(summary = "Xem danh sách đánh giá của loại phòng")
    public ResponseEntity<List<ReviewResponse>> getReviewsForRoomType(@PathVariable UUID roomTypeId) {
        List<ReviewEntity> reviews = reviewService.getReviewsForRoomType(roomTypeId);
        return ResponseEntity.ok(reviews.stream().map(this::mapToReviewResponse).toList());
    }

    private ReviewResponse mapToReviewResponse(ReviewEntity review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getUsername(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
