# 🏨 Hotel Management & Online Booking System (Clean Architecture)

<div align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.1-6DB33F?style=for-the-badge&logo=spring)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis_Redisson-3.32-DC382D?style=for-the-badge&logo=redis)
![WebSocket STOMP](https://img.shields.io/badge/WebSocket-STOMP-008080?style=for-the-badge)

**Hệ thống Quản lý & Đặt phòng Khách sạn Trực tuyến Chuẩn Doanh nghiệp**  
Tuân thủ nghiêm ngặt mô hình **Clean Architecture**, tích hợp **Live Chat Real-time (WebSocket STOMP)**, **Java 21 Virtual Threads**, và **Redisson Distributed Lock**.

</div>

---

## 🌟 Tóm Tắt Tính Năng Nổi Bật

### 1. 🏗️ Clean Architecture & Java 21 Virtual Threads
- **Kiến trúc phân lớp chuẩn:** Tách biệt hoàn toàn tầng nghiệp vụ (`usecase/service`) khỏi giao tiếp HTTP (`infrastructure/adapter/in/web`) và cơ sở dữ liệu (`infrastructure/adapter/out/persistence`).
- **Virtual Threads (Project Loom):** Mỗi request HTTP và phiên kết nối WebSocket STOMP được xử lý trên một Virtual Thread độc lập (`server.tomcat.threads.virtual.enabled=true`), giúp hệ thống chịu tải hàng ngàn kết nối đồng thời với bộ nhớ cực nhỏ.

### 2. 💬 Live Chat Real-time (WebSocket STOMP) & Tự Động Dọn Dẹp
- **Giao tiếp 2 chiều tức thì (< 10ms):** Sử dụng Spring WebSocket STOMP (`/topic/rooms/{id}`, `/topic/admin/chat-alerts`). Khách hàng và Lễ tân/Admin trò chuyện trực tiếp không cần polling (0% overhead).
- **Tự động ngắt kết nối thông minh:** `ChatRoomCleanupScheduler` tự động quét mỗi phút (`@Scheduled`). Nếu phòng chat không có phản hồi nào sau **5 phút**, hệ thống tự động đóng phòng (`CLOSED`) và gửi thông báo hệ thống đến hai bên. Lễ tân cũng có nút đóng chủ động khi hoàn tất hỗ trợ.

### 3. 📊 Type-Safe Aggregation Reporting (Solution 1)
- **Loại bỏ 100% SQL thô (`@Query`) & `Object[]` mạo hiểm:** Không viết câu SQL gộp bảng dễ gây lỗi `ClassCastException`.
- **Tối ưu truy vấn N+1:** Sử dụng `@EntityGraph(attributePaths = {"room", "room.roomType", "invoice"})` tải sẵn dữ liệu liên kết chỉ trong **1 câu truy vấn LEFT JOIN FETCH**.
- **Java Stream API (`groupingBy` & `reducing`):** Tổng hợp báo cáo doanh thu theo loại phòng (BM5.1) và mật độ sử dụng phòng (BM5.2) ngay tại tầng Service, đảm bảo an toàn kiểu dữ liệu tuyệt đối và dễ dàng viết Unit Test.

### 4. 🔒 Redisson Distributed Lock & Snapshot Pricing (QĐ4, QĐ6)
- **Chống Race Condition & Double Billing:** Sử dụng `RLock.tryLock(0, 30, TimeUnit.SECONDS)` khóa tài nguyên phòng (`lock:room:{roomId}`) trong thời điểm thanh toán/checkout, ngăn chặn tuyệt đối tình trạng hai nhân viên cùng thanh toán 1 phòng.
- **Tính tiền động & Bất biến dữ liệu:**
  ```text
  Thành tiền = Số ngày × Đơn giá × (1 + Phụ thu) × Hệ số nước ngoài
  ```
  - Tự động áp dụng phụ thu `+25%` nếu từ 3 khách trở lên (`MAX_GUESTS_PER_ROOM`).
  - Tự động áp dụng hệ số `×1.5` nếu có khách quốc tịch nước ngoài (`FOREIGN`).
  - Lưu **Snapshot** giá trị cấu hình tại thời điểm xuất hóa đơn vào `InvoiceDetailEntity`. Các hóa đơn cũ không bao giờ bị thay đổi dù Admin điều chỉnh tham số động sau này.

### 5. 🏨 Tra Cứu & Quản Lý Phòng Toàn Diện (CRUD)
- **Khách hàng (`RoomsPage.jsx`):** Tìm kiếm theo từ khóa real-time, lọc theo loại phòng (A, B, C), lọc trạng thái (Trống / Đang thuê), sắp xếp giá, và xem Pop-up Đặt phòng trực quan.
- **Lễ tân & Admin (`RoomSearch.jsx`):** Giao diện quản lý trọn gói với Modal Thêm mới, Sửa thông tin, Xóa phòng an toàn (kiểm tra tính toàn vẹn lịch sử thuê phòng trước khi xóa).

---

## 👥 Tài Khoản Mặc Định (Seeded on Startup)

Khi khởi động hệ thống, `DatabaseSeeder` sẽ tự động nạp sẵn các tài khoản sau để bạn trải nghiệm ngay:

| Tài khoản | Mật khẩu | Quyền hạn (Role) | Chức năng chính |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **ADMIN** | Toàn quyền hệ thống: CRUD phòng, xem báo cáo doanh thu BM5, cấu hình tham số QĐ6, Live chat. |
| `receptionist` | `recep123` | **RECEPTIONIST** | Lễ tân: Lập phiếu thuê BM2, tính tiền hóa đơn BM4, CRUD phòng, hỗ trợ Live chat với khách. |
| `customer` | `cust123` | **CUSTOMER** | Khách hàng: Tra cứu phòng, đặt phòng, trò chuyện trực tiếp qua Live chat với Lễ tân. |

---

## 🛠️ Yêu Cầu Hệ Thống & Cài Đặt Local

### Yêu cầu
- **Java JDK:** 21 (Amazon Corretto, Eclipse Temurin, hoặc OpenJDK 21)
- **Node.js:** 18.x hoặc 20.x (`npm` 9+)
- **Database:** PostgreSQL 15+ (Mặc định port `5432` hoặc `31221` cấu hình trong `application.yml`)
- **Redis Server:** Redis 6+ (Mặc định port `6379`)

### 1. Khởi động Backend (Spring Boot 3 + Java 21)
```bash
cd backend

# Tải dependency và build
mvn clean package -DskipTests

# Chạy ứng dụng
mvn spring-boot:run
```
> Server Backend sẽ chạy tại: `http://localhost:8080`  
> Tài liệu Swagger API Docs: `http://localhost:8080/swagger-ui.html`

### 2. Khởi động Frontend (React + Vite)
```bash
cd frontend

# Cài đặt các gói thư viện (TailwindCSS, @stomp/stompjs, sockjs-client, axios)
npm install

# Khởi chạy server phát triển
npm run dev
```
> Giao diện Khách hàng: `http://localhost:3000/`  
> Giao diện Quản trị / Lễ tân: `http://localhost:3000/admin`

---

## 🚀 Hướng Dẫn Deploy Miễn Phí (100% Free Tier 1-Click)

Dự án đã được tích hợp sẵn các file cấu hình hạ tầng (`render.yaml`, `vercel.json`, `netlify.toml`, `.env.example`) giúp bạn dễ dàng deploy lên các nền tảng miễn phí tốt nhất hiện nay:

### 1. Chuẩn bị Database & Cache (Miễn phí)
- **PostgreSQL:** Tạo database miễn phí tại [Neon.tech](https://neon.tech) (Serverless PostgreSQL) hoặc [Supabase](https://supabase.com). Lấy thông tin `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- **Redis:** Tạo cụm Redis serverless miễn phí tại [Upstash.com](https://upstash.com). Lấy `REDIS_HOST`, `REDIS_PORT`.

### 2. Deploy Backend (Render.com)
1. Push code lên GitHub.
2. Đăng nhập [Render.com](https://render.com), chọn **New $\rightarrow$ Blueprint** và chọn repository của bạn.
3. Render tự động nhận diện file `render.yaml` và build `backend/Dockerfile` Java 21.
4. Nhập các biến môi trường từ Neon và Upstash vào bảng hỏi của Render là xong!

### 3. Deploy Frontend (Vercel.com hoặc Netlify)
1. Đăng nhập [Vercel.com](https://vercel.com) $\rightarrow$ **Add New Project** $\rightarrow$ Chọn thư mục `frontend`.
2. Vào **Settings $\rightarrow$ Environment Variables**, thêm 2 biến:
   ```env
   VITE_API_URL=https://<tên-backend-render-của-bạn>.onrender.com/api/v1
   VITE_WS_URL=https://<tên-backend-render-của-bạn>.onrender.com/api/v1/ws-chat
   ```
3. Bấm **Deploy**. Nhờ có `vercel.json` & `netlify.toml`, mọi route SPA của React Router sẽ hoạt động mượt mà không bị lỗi `404 Not Found` khi F5!

---

## 📁 Sơ Đồ Kiến Trúc Thư Mục (Clean Architecture)

```
online-movie-booking/
├── backend/
│   └── src/main/java/com/hotel/booking/
│       ├── usecase/
│       │   ├── service/                 ← Business Logic Layer (@Service)
│       │   │   ├── RoomService.java     ← CRUD Phòng & Tra cứu
│       │   │   ├── RentalService.java   ← BM2 Lập phiếu thuê phòng
│       │   │   ├── InvoiceService.java  ← BM4 Tính tiền & Redisson Distributed Lock
│       │   │   ├── ReportService.java   ← BM5 Báo cáo Type-Safe Stream API
│       │   │   ├── ParameterService.java← QĐ6 Quản lý tham số động
│       │   │   └── ChatService.java     ← Quản lý phòng & tin nhắn Live Chat
│       │   └── scheduler/
│       │       └── ChatRoomCleanupScheduler.java ← Tự động đóng chat sau 5 phút idle
│       ├── infrastructure/
│       │   ├── adapter/in/web/          ← Presentation Layer (Controllers & REST / STOMP APIs)
│       │   │   ├── HotelController.java
│       │   │   ├── ChatController.java  ← @MessageMapping & REST
│       │   │   └── AuthController.java
│       │   ├── adapter/out/persistence/ ← Persistence Layer (JPA Entities & Repositories)
│       │   │   ├── entity/
│       │   │   └── repository/          ← @EntityGraph optimized
│       │   └── config/                  ← Security, WebSocket STOMP, Redisson, Virtual Threads
└── frontend/
    ├── src/
    │   ├── customer/                    ← Giao diện Khách hàng (RoomsPage, BookingModal, ChatBox)
    │   ├── features/                    ← Giao diện Admin/Lễ tân (rooms, checkin, checkout, reports, chat)
    │   └── lib/
    │       ├── axios.js                 ← Axios client injected JWT & VITE_API_URL
    │       └── stompClient.js           ← Singleton STOMP WebSocket manager
    ├── vercel.json                      ← SPA routing config
    └── netlify.toml                     ← SPA routing config
```

---

## 🤝 Kiểm Thử & Kiểm Định Chất Lượng (Unit Tests)

Dự án sử dụng **JUnit 5 + Mockito** để kiểm thử tự động các logic nghiệp vụ quan trọng (đặc biệt là công thức tính tiền QĐ4 trong `InvoiceServiceTest`) mà không cần phụ thuộc vào Spring Context hay Database thực tế.

Để chạy bộ kiểm thử Unit Test:
```bash
cd backend
mvn test
```

---
*Phát triển bởi Clean Architecture Engineering Team — 2026*
