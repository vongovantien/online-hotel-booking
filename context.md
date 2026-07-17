# Project Context: Hotel Management System (Online Hotel Booking & Admin Management)

## 1. Overview & System Persona
- **Role for AI:** You are a Senior Fullstack Engineer & Solution Architect specializing in Java 21, Spring Boot 3.3.x (Clean Architecture), and ReactJS (Vite + TailwindCSS + STOMP WebSocket).
- **Project Goal:** A production-ready Hotel Management & Online Booking system adhering to Vietnamese hotel management standards (BM2, BM3, BM4, BM5, QĐ2, QĐ4, QĐ6).
- **Core Capabilities:**
  1. **Clean Architecture Backend:** Package division by domain & use case (`usecase/service`, `infrastructure/adapter/in/web`, `infrastructure/adapter/out/persistence`).
  2. **Real-time Live Chat (WebSocket STOMP):** Instant bidirectional communication between Customers and Receptionists/Admins using Spring WebSocket STOMP (`/topic`, `/app`) with auto-cleanup scheduler.
  3. **Type-Safe Aggregation (Solution 1):** Elimination of raw `@Query` / `Object[]` in reporting by leveraging Spring Data JPA Method Naming (`@EntityGraph`) and Java 21 Stream API (`groupingBy` & `reducing`).
  4. **High Concurrency & Integrity:** Redisson Distributed Lock for checkout/billing and immutable invoice snapshotting.

---

## 2. Tech Stack & Environment
- **Backend Core:** Java 21, Spring Boot 3.3.1 (Virtual Threads enabled via `server.tomcat.threads.virtual.enabled=true`).
- **Real-time Engine:** Spring WebSocket (`spring-boot-starter-websocket`), STOMP Broker (`/ws-chat`, `/topic`, `/app`).
- **Database & Cache:** PostgreSQL (Primary SQL with Hibernate/JPA), Redis (Redisson 3.32.0 for distributed locking on checkouts + stateless JWT blacklist).
- **Security:** Spring Security 6, Stateless JWT (`jjwt 0.12.6`), Role-Based Access Control (`hasAnyRole("CUSTOMER", "RECEPTIONIST", "ADMIN")`).
- **Frontend:** ReactJS (Vite, TailwindCSS, `@stomp/stompjs` + `sockjs-client` singleton STOMP client).
- **Documentation & Testing:** `springdoc-openapi` (Swagger UI at `/swagger-ui.html`), JUnit 5 + Mockito.

---

## 3. Project Structure (Clean Architecture)
```
com.hotel.booking
├── usecase/
│   ├── service/                 ← Business logic services (@Service)
│   │   ├── RoomService          ← BM3 & CRUD Phòng (Search, Create, Update, Delete)
│   │   ├── RentalService        ← BM2: Lập phiếu thuê phòng (QĐ2 max guests check)
│   │   ├── InvoiceService       ← BM4: Lập hóa đơn (Distributed Lock + Snapshot pricing)
│   │   ├── ReportService        ← BM5: Báo cáo doanh thu & mật độ (Java Stream groupingBy)
│   │   ├── ParameterService     ← QĐ6: Quản lý tham số động (surcharge, coefficients)
│   │   ├── ChatService          ← Quản lý phòng chat, lưu tin nhắn & trạng thái đã đọc
│   │   └── AuthService          ← JWT Auth, Register, Login, Logout (Redis blacklist)
│   └── scheduler/
│       └── ChatRoomCleanupScheduler ← Quét tự động mỗi phút, đóng phòng chat sau 5 phút idle
│
├── infrastructure/
│   ├── adapter/in/web/          ← Presentation Layer (Controllers & REST APIs)
│   │   ├── HotelController      ← Endpoints cho Rooms (CRUD + Search), Rentals, Invoices, Reports
│   │   ├── ChatController       ← Endpoints & WebSocket @MessageMapping cho Live Chat
│   │   ├── AuthController       ← /api/v1/auth/* (Login, Register, Logout)
│   │   └── dto/                 ← Java Records for immutable DTOs
│   │
│   ├── adapter/out/persistence/ ← Persistence Layer
│   │   ├── entity/              ← JPA Entities (@Table, @Entity, @Enumerated)
│   │   └── repository/          ← Spring Data JPA Repositories (@Repository)
│   │
│   └── config/                  ← Infrastructure Configurations
│       ├── security/            ← SecurityConfig, JwtService, JwtAuthenticationFilter
│       ├── WebSocketConfig.java ← STOMP Broker setup (/api/v1/ws-chat)
│       ├── AppConfig.java       ← Transaction management & Async setup
│       ├── DatabaseSeeder.java  ← Seed admin, receptionist, customer, room types, parameters
│       └── VirtualThreadConfig  ← Java 21 Virtual Threads setup
```

---

## 4. Core Business Rules & Workflows

### Workflow 1: Live Chat WebSocket STOMP (Real-time Communication)
1. **Connection:** Frontend connects to `http://localhost:8080/api/v1/ws-chat` via SockJS + STOMP (`src/lib/stompClient.js`).
2. **Subscriptions:**
   - Customer subscribes to `/topic/rooms/{roomId}` for instant message delivery and room closure alerts.
   - Admin/Receptionist subscribes to `/topic/admin/chat-alerts` for incoming chat room notifications, and `/topic/rooms/{roomId}` when viewing a specific room.
3. **Sending Messages:**
   - REST endpoints (`POST /api/v1/chat/rooms/{roomId}/messages` or `POST /api/v1/chat/init`) or STOMP push (`SimpMessagingTemplate`) automatically broadcast `ChatMessageDTO` to subscribers.
4. **Auto-Cleanup & Manual Closure:**
   - Admin can manually click "⏹️ Kết thúc chat" (`PUT /api/v1/chat/rooms/{roomId}/close`).
   - `ChatRoomCleanupScheduler` runs every minute (`@Scheduled(fixedRate = 60000)`) and closes rooms with no reply for > 5 minutes (`ChatStatusEntity.CLOSED`), pushing system alerts to both parties.

### Workflow 2: Reporting Type-Safe Aggregation (Solution 1 Clean Architecture)
1. **Rule:** Never write raw SQL `@Query` returning `Object[]` for business calculations.
2. **Repository:** Use Spring Data JPA Method Naming with `@EntityGraph` to fetch necessary graph without N+1 query:
   ```java
   @EntityGraph(attributePaths = {"room", "room.roomType", "invoice"})
   List<InvoiceDetailEntity> findByInvoice_PaymentDateBetween(LocalDateTime start, LocalDateTime end);
   ```
3. **Service layer (`ReportService`):** Use Java Stream API (`Collectors.groupingBy` & `Collectors.reducing`) to aggregate revenue and utilization rates cleanly, fully type-safe and easily unit-testable without database dependencies.

### Workflow 3: Room Management (CRUD & Search)
1. **Search (`GET /api/v1/rooms`):** Public access. Supports filtering by room type (`A`, `B`, `C`) and status (`AVAILABLE`, `RENTED`, `MAINTENANCE`).
2. **Mutation (`POST`, `PUT`, `DELETE /api/v1/rooms`):** Restricted to `RECEPTIONIST` and `ADMIN`.
3. **Integrity Check:** Rooms currently in `RENTED` status or linked to historical rental records cannot be hard-deleted without safety validation.

### Workflow 4: Room Rental & Checkout Pricing (BM2, BM4, QĐ4, QĐ6)
1. **Rental creation (`POST /api/v1/rentals`):** Room must be `AVAILABLE`. Total guests verified against `SystemParameter.MAX_GUESTS_PER_ROOM`.
2. **Checkout Pricing (`POST /api/v1/invoices/checkout`):**
   - Protected by Redisson Distributed Lock: `RLock.tryLock(0, 30, TimeUnit.SECONDS)` on `lock:room:{roomId}`.
   - Formula: `Total = Days × BasePrice × (1 + SurchargeRatio) × ForeignCoefficient`.
   - Surcharge applied (`+25%`) if guests ≥ 3; Foreign coefficient (`×1.5`) if ≥ 1 foreign guest.
   - Price snapshot (`basePriceSnapshot`, `surchargeRatioApplied`, `coefficientApplied`) saved into `InvoiceDetailEntity`. Historical invoices remain immutable even if dynamic parameters (`system_parameters`) change later.

---

## 5. Coding & Architectural Standards
- **Java 21 & Spring Boot:** Use Constructor Injection (`@RequiredArgsConstructor` or explicit constructors). Use Java Records for web DTOs.
- **REST vs WebSocket:** Use REST for initial state loading / heavy CRUD; use STOMP WebSocket for low-latency event pushing (`SimpMessagingTemplate`).
- **Frontend ReactJS:** Modular architecture inside `src/features/` (auth, rooms, checkin, checkout, reports, settings, chat) and `src/customer/`. Use `stompClient.js` for singleton connection management.
- **Error Handling:** Centralized `@ControllerAdvice` (`GlobalExceptionHandler`) returning structured JSON error payloads.
