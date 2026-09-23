# Online Hotel Booking & Management System

Hệ thống quản lý và đặt phòng khách sạn trực tuyến, được thiết kế theo mô hình Clean Architecture nhằm đảm bảo dễ bảo trì và mở rộng.

## Công nghệ sử dụng

- **Backend:** Java 21, Spring Boot 3.3, Spring Security (Stateless JWT), Spring WebSocket (STOMP), Redisson
- **Frontend:** React 18, Vite, Tailwind CSS, StompJS
- **Cơ sở dữ liệu & Cache:** PostgreSQL, Redis

## Tính năng chính

- **Khách hàng:**
  - Tra cứu, tìm kiếm và lọc phòng theo trạng thái, loại phòng và giá cả.
  - Đặt phòng trực tuyến (có khóa phân tán chống xung đột phòng).
  - Thanh toán trực tuyến tích hợp VNPay Sandbox.
  - Chat trực tiếp (real-time) với nhân viên lễ tân để được hỗ trợ.

- **Nhân viên / Lễ tân & Quản trị (Admin):**
  - Quản lý danh sách phòng (Thêm, Sửa, Xóa).
  - Lập phiếu thuê phòng và kiểm soát số lượng khách tối đa.
  - Xuất hóa đơn thanh toán: tự động áp dụng giá phòng, phụ thu (từ khách thứ 3) và hệ số khách quốc tế theo cấu hình hệ thống.
  - Khóa phân tán (Distributed Lock) giúp ngăn chặn xung đột khi nhiều nhân viên cùng thao tác thanh toán / đặt phòng.
  - Báo cáo thống kê doanh thu và mật độ sử dụng phòng.
  - Quản lý các phiên chat hỗ trợ khách hàng (tự động đóng sau 5 phút không phản hồi).

## Tài khoản mặc định

Sau khi khởi động ứng dụng, hệ thống tự động khởi tạo các tài khoản mẫu:

| Tài khoản | Mật khẩu | Quyền |
| :--- | :--- | :--- |
| `admin` | `Admin@123` | Quản trị viên hệ thống |
| `receptionist` | `Receptionist@123` | Nhân viên lễ tân |
| `customer` | `Customer@123` | Khách hàng |

## Hướng dẫn cài đặt và chạy local

### Yêu cầu hệ thống
- JDK 21
- Node.js 18+
- PostgreSQL (Cấu hình kết nối trong `backend/src/main/resources/application.yml`)
- Redis (Cấu hình trong `backend/src/main/resources/redisson.yml`)

### 1. Khởi động Backend
```bash
cd backend
mvn clean spring-boot:run
```
- Server chạy tại: `http://localhost:8080`
- API Documentation (Swagger): `http://localhost:8080/swagger-ui.html`

### 2. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```
- Giao diện Khách hàng: `http://localhost:5173/`
- Giao diện Quản trị / Lễ tân: `http://localhost:5173/admin`

## Hướng dẫn Deploy

Dự án đã được cấu hình sẵn các file hỗ trợ deploy:
- **Backend (`render.yaml`):** Có thể deploy tự động qua Blueprint trên Render.com hoặc sử dụng `Dockerfile` cho Koyeb / Fly.io.
- **Frontend (`vercel.json`, `netlify.toml`):** Hỗ trợ routing cho Single Page Application, deploy trực tiếp lên Vercel hoặc Netlify bằng cách cấu hình biến môi trường `VITE_API_URL` và `VITE_WS_URL` trỏ về domain backend.
