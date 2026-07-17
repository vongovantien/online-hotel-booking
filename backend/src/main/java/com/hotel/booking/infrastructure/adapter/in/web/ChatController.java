package com.hotel.booking.infrastructure.adapter.in.web;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.hotel.booking.infrastructure.adapter.in.web.dto.*;
import com.hotel.booking.usecase.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "*")
@Tag(name = "Live Chat & Customer Support", description = "Hệ thống tư vấn & chăm sóc khách hàng thời gian thực")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/init")
    @Operation(summary = "Khởi tạo hoặc tải lại phòng chat cho Khách hàng",
               description = "Khách hàng nhập tên/email để bắt đầu trò chuyện. Hệ thống tự tạo phòng nếu chưa có.")
    public ResponseEntity<ChatRoomResponse> initRoom(@Valid @RequestBody InitChatRequest request) {
        ChatRoomResponse res = chatService.initOrGetRoom(request.customerName(), request.customerEmail());
        try {
            messagingTemplate.convertAndSend("/topic/admin/chat-alerts", "ROOM_UPDATED");
        } catch (Exception ignored) {}
        return ResponseEntity.ok(res);
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Danh sách toàn bộ phòng chat (Cho Lễ tân/Admin)",
               description = "Sắp xếp theo hoạt động mới nhất, kèm số lượng tin nhắn chưa đọc từ khách hàng.")
    public ResponseEntity<List<ChatRoomResponse>> getAllRooms() {
        return ResponseEntity.ok(chatService.getAllRooms());
    }

    @GetMapping("/rooms/{roomId}")
    @Operation(summary = "Xem thông tin phòng chat theo ID")
    public ResponseEntity<ChatRoomResponse> getRoom(@PathVariable UUID roomId) {
        return ResponseEntity.ok(chatService.getRoom(roomId));
    }

    @GetMapping("/rooms/{roomId}/messages")
    @Operation(summary = "Lấy lịch sử tin nhắn của phòng chat")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable UUID roomId) {
        return ResponseEntity.ok(chatService.getMessages(roomId));
    }

    @PostMapping("/rooms/{roomId}/messages")
    @Operation(summary = "Gửi tin nhắn mới (Khách hàng hoặc Lễ tân/Admin)",
               description = "Nếu khách gửi, tăng đếm tin nhắn chưa đọc. Nếu Admin gửi, xóa đếm tin nhắn chưa đọc.")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable UUID roomId,
            @Valid @RequestBody SendMessageRequest request) {
        ChatMessageResponse res = chatService.sendMessage(roomId, request.senderRole(), request.senderName(), request.content());
        try {
            // Push tin nhắn mới ngay cho những ai đang xem phòng này
            messagingTemplate.convertAndSend("/topic/rooms/" + roomId, res);
            // Push thông báo cho Admin cập nhật danh sách/huy hiệu
            messagingTemplate.convertAndSend("/topic/admin/chat-alerts", "NEW_MESSAGE");
        } catch (Exception ignored) {}
        return ResponseEntity.ok(res);
    }

    @PostMapping("/rooms/{roomId}/read")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Đánh dấu đã đọc phòng chat (Cho Lễ tân/Admin)")
    public ResponseEntity<ChatRoomResponse> markAsRead(@PathVariable UUID roomId) {
        ChatRoomResponse res = chatService.markRoomAsRead(roomId);
        try {
            messagingTemplate.convertAndSend("/topic/admin/chat-alerts", "ROOM_UPDATED");
        } catch (Exception ignored) {}
        return ResponseEntity.ok(res);
    }

    @PostMapping("/rooms/{roomId}/close")
    @PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
    @Operation(summary = "Kết thúc/đóng phòng chat (Cho Lễ tân/Admin)")
    public ResponseEntity<ChatRoomResponse> closeRoom(@PathVariable UUID roomId) {
        return ResponseEntity.ok(chatService.closeRoom(roomId));
    }
}
