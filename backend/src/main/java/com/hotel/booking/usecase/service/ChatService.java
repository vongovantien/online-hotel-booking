package com.hotel.booking.usecase.service;

import com.hotel.booking.infrastructure.adapter.in.web.dto.ChatMessageResponse;
import com.hotel.booking.infrastructure.adapter.in.web.dto.ChatRoomResponse;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ChatMessageEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.entity.ChatRoomEntity;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.ChatMessageRepository;
import com.hotel.booking.infrastructure.adapter.out.persistence.repository.ChatRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ChatRoomRepository chatRoomRepository,
                       ChatMessageRepository chatMessageRepository,
                       @Autowired(required = false) SimpMessagingTemplate messagingTemplate) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ChatRoomResponse initOrGetRoom(String customerName, String customerEmail) {
        Optional<ChatRoomEntity> existing = Optional.empty();
        if (customerEmail != null && !customerEmail.isBlank()) {
            existing = chatRoomRepository.findByCustomerEmailAndStatus(customerEmail, "OPEN");
        }
        if (existing.isEmpty() && customerName != null && !customerName.isBlank()) {
            existing = chatRoomRepository.findByCustomerNameAndStatus(customerName, "OPEN");
        }

        ChatRoomEntity room;
        if (existing.isPresent()) {
            room = existing.get();
        } else {
            room = ChatRoomEntity.builder()
                    .customerName(customerName)
                    .customerEmail(customerEmail)
                    .status("OPEN")
                    .unreadAdminCount(0)
                    .lastMessage("Cuộc trò chuyện mới được tạo")
                    .lastMessageAt(LocalDateTime.now())
                    .build();
            room = chatRoomRepository.save(room);

            // Create initial welcome message from system
            ChatMessageEntity welcomeMsg = ChatMessageEntity.builder()
                    .roomId(room.getId())
                    .senderRole("ADMIN")
                    .senderName("Lễ tân Khách Sạn")
                    .content("Xin chào " + customerName + "! Khách sạn có thể hỗ trợ gì cho bạn hôm nay?")
                    .build();
            chatMessageRepository.save(welcomeMsg);
        }

        return mapToRoomResponse(room);
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getAllRooms() {
        return chatRoomRepository.findAllByOrderByLastMessageAtDesc().stream()
                .map(this::mapToRoomResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatRoomResponse getRoom(UUID roomId) {
        ChatRoomEntity room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng chat với ID: " + roomId));
        return mapToRoomResponse(room);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID roomId) {
        return chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(this::mapToMessageResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(UUID roomId, String senderRole, String senderName, String content) {
        ChatRoomEntity room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng chat với ID: " + roomId));

        ChatMessageEntity msg = ChatMessageEntity.builder()
                .roomId(roomId)
                .senderRole(senderRole)
                .senderName(senderName)
                .content(content)
                .build();
        msg = chatMessageRepository.save(msg);

        room.setLastMessage(content);
        room.setLastMessageAt(LocalDateTime.now());

        if ("CUSTOMER".equalsIgnoreCase(senderRole)) {
            room.setUnreadAdminCount(room.getUnreadAdminCount() + 1);
        } else {
            room.setUnreadAdminCount(0);
        }
        chatRoomRepository.save(room);

        return mapToMessageResponse(msg);
    }

    @Transactional
    public ChatRoomResponse markRoomAsRead(UUID roomId) {
        ChatRoomEntity room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng chat với ID: " + roomId));
        room.setUnreadAdminCount(0);
        room = chatRoomRepository.save(room);
        return mapToRoomResponse(room);
    }

    @Transactional
    public ChatRoomResponse closeRoom(UUID roomId) {
        ChatRoomEntity room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng chat với ID: " + roomId));
        if (!"CLOSED".equals(room.getStatus())) {
            room.setStatus("CLOSED");
            room = chatRoomRepository.save(room);

            ChatMessageEntity closeMsg = ChatMessageEntity.builder()
                    .roomId(roomId)
                    .senderRole("ADMIN")
                    .senderName("Hệ thống")
                    .content("Cuộc trò chuyện đã được kết thúc bởi Lễ tân/Quản trị viên.")
                    .build();
            closeMsg = chatMessageRepository.save(closeMsg);

            if (messagingTemplate != null) {
                try {
                    messagingTemplate.convertAndSend("/topic/rooms/" + roomId, mapToMessageResponse(closeMsg));
                    messagingTemplate.convertAndSend("/topic/admin/chat-alerts", "ROOM_UPDATED");
                } catch (Exception ignored) {}
            }
        }
        return mapToRoomResponse(room);
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void autoCloseInactiveRooms() {
        List<ChatRoomEntity> openRooms = chatRoomRepository.findByStatus("OPEN");
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        for (ChatRoomEntity room : openRooms) {
            if (room.getLastMessageAt() != null && room.getLastMessageAt().isBefore(cutoff)) {
                room.setStatus("CLOSED");
                room.setLastMessage("Đã tự động kết thúc do không hoạt động 5 phút");
                chatRoomRepository.save(room);

                ChatMessageEntity timeoutMsg = ChatMessageEntity.builder()
                        .roomId(room.getId())
                        .senderRole("ADMIN")
                        .senderName("Hệ thống")
                        .content("Phiên chat tự động đóng do quá 5 phút không có phản hồi từ người dùng.")
                        .build();
                timeoutMsg = chatMessageRepository.save(timeoutMsg);

                if (messagingTemplate != null) {
                    try {
                        messagingTemplate.convertAndSend("/topic/rooms/" + room.getId(), mapToMessageResponse(timeoutMsg));
                        messagingTemplate.convertAndSend("/topic/admin/chat-alerts", "ROOM_UPDATED");
                    } catch (Exception ignored) {}
                }
            }
        }
    }

    private ChatRoomResponse mapToRoomResponse(ChatRoomEntity room) {
        return new ChatRoomResponse(
                room.getId(),
                room.getCustomerName(),
                room.getCustomerEmail(),
                room.getStatus(),
                room.getUnreadAdminCount(),
                room.getLastMessage(),
                room.getLastMessageAt(),
                room.getCreatedAt()
        );
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessageEntity msg) {
        return new ChatMessageResponse(
                msg.getId(),
                msg.getRoomId(),
                msg.getSenderRole(),
                msg.getSenderName(),
                msg.getContent(),
                msg.getCreatedAt()
        );
    }
}
