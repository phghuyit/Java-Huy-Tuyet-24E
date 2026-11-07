# VELA Salon & Spa — Backend API (`Java-Huy-Tuyet-24E`)

> **Dạ vâng, bọn em xin kính chào Thầy/Cô ạ!**  
> Đây là thư mục chứa mã nguồn REST API (**Spring Boot**) cho hệ thống **Đặt lịch & Quản trị Salon VELA** của nhóm bọn em (**Nhóm trưởng: Phạm Hồng Gia Huy** — **Thành viên: Lê Võ Hồng Tuyết**).  
> Để xem hướng dẫn cài đặt đầy đủ cho cả **Backend + Frontend** và hướng dẫn kiểm thử từng bước trên giao diện web, kính mời Thầy/Cô xem file [`../README.md`](../README.md) ở thư mục gốc ạ.

---

## 🗄️ Sơ Đồ Cơ Sở Dữ Liệu (ERD)

<img width="8192" height="6070" alt="Sơ đồ ERD Hệ thống Đặt lịch & Quản trị Salon VELA" src="https://github.com/user-attachments/assets/250a726a-76d9-40e5-8dbb-7a3217fd705f" />

---

## 🚀 Hướng Dẫn Chạy Nhanh Backend (XAMPP hoặc MySQL Workbench / Docker)

1. Khởi động **MySQL** tại cổng `localhost:3306`:
   - **Nếu dùng XAMPP:** Bấm **Start** tại dòng **MySQL** trên XAMPP Control Panel. Mặc định tài khoản `root` của XAMPP **không có mật khẩu (`""`)**. Thầy/Cô có thể sửa `password: ""` tại dòng 44 trong file `src/main/resources/application.yaml` hoặc chạy lệnh kèm `$env:DB_PASSWORD=""` ở bước 2 ạ.
   - **Nếu dùng MySQL Server / Workbench / Docker:** Cấu hình mặc định trong `src/main/resources/application.yaml` là `username: root` / `password: root`.
   - Hệ thống sẽ tự động tạo database `java_booking_nail`, tạo bảng và nạp dữ liệu mẫu ngay khi khởi động (`createDatabaseIfNotExist=true` và `app.seed-data.enabled=true`).
2. Chạy ứng dụng Spring Boot:
   ```powershell
   # Khi dùng XAMPP (mật khẩu root để trống):
   $env:DB_PASSWORD=""; .\mvnw.cmd spring-boot:run

   # Khi dùng MySQL có mật khẩu là "root":
   .\mvnw.cmd spring-boot:run
   ```
   - Backend chạy tại địa chỉ: `http://localhost:8080`

---

## 🔐 Tài Khoản Kiểm Thử Được Tạo Sẵn

| Phân hệ | Vai trò (Role) | Email đăng nhập | Số điện thoại | Mật khẩu | Đường dẫn đăng nhập |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cổng Quản Trị** | `ADMIN` (Toàn quyền) | `admin@vela.com` *(hoặc `admin@gmail.com`)* | `0901234560` | `Password123!` | `http://localhost:3000/admin/login` |
| **Cổng Quản Trị** | `RECEPTIONIST` (Lễ tân) | `letan@vela.com` *(hoặc `letan@gmail.com`)* | `0901234561` | `Password123!` | `http://localhost:3000/admin/login` |
| **Website Khách Hàng** | `CUSTOMER` (Khách hàng) | `minhanh@example.com` *(hoặc `thuha@example.com`)* | `0910000001` | `Password123!` | `http://localhost:3000/account/login` |

---

## 🙏 Lời Cảm Ơn

> **Dạ vâng, bọn em xin chân thành cảm ơn Thầy/Cô đã dành thời gian trải nghiệm trang web của bọn em ạ!**
