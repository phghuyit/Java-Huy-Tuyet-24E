# VELA Salon & Spa — Hệ Thống Đặt Lịch & Quản Trị Salon (Full-Stack)

> **Dạ vâng, bọn em xin kính chào Thầy/Cô ạ!**  
> Dưới đây là tài liệu hướng dẫn cài đặt, khởi chạy và kiểm thử đồ án cuối kỳ môn **Phát triển ứng dụng Web với Java** của nhóm bọn em.

---

## 👥 Nhóm Sinh Viên Thực Hiện

| STT | Họ và Tên | Vai trò |
| :---: | :--- | :--- |
| 1 | **Phạm Hồng Gia Huy** | **Nhóm trưởng** |
| 2 | **Lê Võ Hồng Tuyết** | **Thành viên** |

**Công nghệ sử dụng trong đồ án:**
- **Backend (`Java-Huy-Tuyet-24E/`):** Java 17/21, Spring Boot, Spring Data JPA, Spring Security (BCrypt & Quản lý phiên đăng nhập độc lập), MapStruct, MySQL 8.x / MariaDB (XAMPP)
- **Frontend (`frontend/`):** Next.js (App Router, thuần JavaScript/JSX), React 19, Tailwind CSS v4, Axios

---

## 🗄️ Sơ Đồ Cơ Sở Dữ Liệu (ERD)

<img width="8192" height="6070" alt="Sơ đồ ERD Hệ thống Đặt lịch & Quản trị Salon VELA" src="https://github.com/user-attachments/assets/250a726a-76d9-40e5-8dbb-7a3217fd705f" />

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
Java-Huy-Tuyet-24E/              # Thư mục gốc của kho lưu trữ (Repository Root)
├── Java-Huy-Tuyet-24E/          # Mã nguồn Backend Spring Boot (Chạy tại cổng 8080)
│   ├── src/main/java/           # Controllers, Services, Repositories, Entities, Seeders
│   ├── src/main/resources/      # application.yaml (Cấu hình Database & Server)
│   ├── src/test/java/           # Kiểm thử tích hợp (Integration Tests) & Unit Tests
│   ├── docs/                    # Tài liệu kỹ thuật & đặc tả API
│   ├── test-data/               # Bộ sưu tập Postman & dữ liệu kiểm thử mẫu
│   └── .env.example             # File mẫu biến môi trường cho Backend
├── frontend/                    # Mã nguồn Frontend Next.js & Cổng Quản Trị (Chạy tại cổng 3000)
│   ├── src/app/(website)/       # Giao diện khách hàng (Trang chủ, Dịch vụ, Kỹ thuật viên, Bộ sưu tập, Tài khoản)
│   ├── src/app/(booking)/       # Luồng đặt lịch hẹn trực tuyến theo từng bước
│   ├── src/app/admin/           # Cổng quản trị dành cho Admin & Lễ tân
│   ├── src/components/          # Các thành phần giao diện dùng chung
│   ├── src/services/            # Các dịch vụ gọi API kết nối với Backend Spring Boot
│   └── .env.example             # File mẫu biến môi trường cho Frontend
└── .gitignore                   # Cấu hình loại trừ file thừa cho cả Backend & Frontend
```

---

## ⚙️ Yêu Cầu Môi Trường (Prerequisites)

1. **Java JDK:** Phiên bản **21 (LTS)** hoặc **25** *(Lưu ý khi mở bằng IntelliJ IDEA: Vào `File -> Project Structure -> Project -> SDK` chọn **JDK 21** hoặc **JDK 25**, không chọn JDK 26/27 vì thư viện Lombok chưa tương thích với trình biên dịch của JDK 26+ và nhớ bấm **Enable annotation processing** nếu IntelliJ hiển thị thông báo ở góc dưới).*
2. **Node.js:** Phiên bản 18.x hoặc 20+ (kèm theo `npm`)
3. **Cơ sở dữ liệu MySQL (chọn 1 trong 2):**
   - **XAMPP** (MySQL / MariaDB chạy ở cổng mặc định `3306`), **HOẶC**
   - **MySQL Server / MySQL Workbench / Docker** (chạy ở cổng `3306`)

---

## 🚀 Hướng Dẫn Clone & Cài Đặt Chi Tiết Từng Bước

### Bước 1: Clone dự án về máy

Dạ, Thầy/Cô mở Terminal hoặc PowerShell và chạy lệnh sau để tải mã nguồn về máy ạ:

```powershell
git clone https://github.com/phghuyit/Java-Huy-Tuyet-24E.git
cd Java-Huy-Tuyet-24E
```
*(Dạ nếu Thầy/Cô kiểm tra trên nhánh `phamhonggiahuy`, Thầy/Cô có thể chạy lệnh: `git clone -b phamhonggiahuy https://github.com/phghuyit/Java-Huy-Tuyet-24E.git` ạ).*

---

### Bước 2: Khởi động MySQL (Dùng XAMPP hoặc MySQL Workbench / Docker)

> **💡 Dạ vâng, hệ thống tự động tạo Database & dữ liệu mẫu (Không cần import file `.sql`):**  
> Dạ Thầy/Cô **không cần** tạo database thủ công hay import file `.sql` trong phpMyAdmin / MySQL Workbench ạ. Ngay khi Backend khởi động lần đầu, hệ thống của bọn em sẽ tự động tạo database `java_booking_nail` (`createDatabaseIfNotExist=true`), tự động sinh toàn bộ bảng qua Hibernate JPA và nạp sẵn dữ liệu mẫu (danh mục, dịch vụ, nhân viên, lịch hẹn, mã giảm giá, sản phẩm, đánh giá và các tài khoản mẫu) để Thầy/Cô thuận tiện kiểm thử ngay.

#### Cách A: Nếu Thầy/Cô sử dụng XAMPP (Mật khẩu `root` mặc định để trống `""`)
1. Mở **XAMPP Control Panel** và bấm **Start** tại dòng **MySQL** (đảm bảo MySQL đang chạy ở cổng `3306`).
2. Do tài khoản `root` của MySQL trên XAMPP mặc định **không có mật khẩu (rỗng `""`)**, Thầy/Cô có thể chọn **1 trong 2 cách** sau ạ:
   - **Cách 1 (Sửa trực tiếp trong `application.yaml`):** Mở file `Java-Huy-Tuyet-24E/src/main/resources/application.yaml` (dòng 44) và sửa `password` thành chuỗi rỗng `""`:
     ```yaml
     spring:
       datasource:
         url: "${DB_URL:jdbc:mysql://localhost:3306/java_booking_nail?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=UTF-8}"
         username: "${DB_USERNAME:root}"
         password: ""
     ```
   - **Cách 2 (Truyền biến môi trường khi chạy lệnh ở Bước 3):** Không cần sửa file, chỉ cần chạy lệnh khởi động kèm `$env:DB_PASSWORD=""` như hướng dẫn ở Bước 3 bên dưới ạ.

#### Cách B: Nếu Thầy/Cô sử dụng MySQL Server / MySQL Workbench / Docker
1. Đảm bảo dịch vụ MySQL đang chạy tại `localhost:3306`.
2. Mặc định file `Java-Huy-Tuyet-24E/src/main/resources/application.yaml` bọn em đang cấu hình sẵn:
   - **Username:** `root`
   - **Password:** `root`
   - *(Dạ nếu MySQL trên máy Thầy/Cô dùng mật khẩu khác, Thầy/Cô chỉ cần đổi giá trị `password` tại dòng 44 trong `application.yaml` hoặc đặt biến môi trường `$env:DB_PASSWORD="mat_khau_cua_thay_co"` ạ).*

---

### Bước 3: Khởi động Backend Spring Boot (`Cổng 8080`)

Mở Terminal tại thư mục `Java-Huy-Tuyet-24E` và chạy:

```powershell
cd Java-Huy-Tuyet-24E

# Trường hợp 1: Nếu Thầy/Cô dùng XAMPP (mật khẩu root rỗng):
$env:DB_PASSWORD=""; .\mvnw.cmd spring-boot:run

# Trường hợp 2: Nếu Thầy/Cô dùng MySQL / Docker có mật khẩu là "root" (hoặc đã sửa trong application.yaml):
.\mvnw.cmd spring-boot:run
```
*(Trên macOS/Linux: `DB_PASSWORD="" ./mvnw spring-boot:run` hoặc `./mvnw spring-boot:run`)*

- Đợi đến khi màn hình console hiển thị dòng `Started BookingNailApplication`.
- Backend API sẽ hoạt động tại địa chỉ: **`http://localhost:8080`**

---

### Bước 4: Khởi động Frontend Next.js (`Cổng 3000`)

Mở một **cửa sổ Terminal thứ hai** từ thư mục gốc của dự án và di chuyển vào thư mục `frontend`:

```powershell
cd frontend
npm install
npm run dev
```
*(Dạ lưu ý: File `.env.local` là tùy chọn vì mặc định Frontend của bọn em đã tự động kết nối về `http://localhost:8080` rồi ạ. Nếu cần đổi địa chỉ Backend, Thầy/Cô có thể sao chép file `.env.example` thành `.env.local`.)*

- Giao diện Website sẽ hoạt động tại địa chỉ: **`http://localhost:3000`**

---

## 🔐 Danh Sách Tài Khoản & Mật Khẩu Dùng Để Kiểm Thử (Tự Động Khởi Tạo)

Dạ vâng, toàn bộ các tài khoản dưới đây đã được hệ thống của bọn em tự động tạo sẵn khi chạy Backend để Thầy/Cô đăng nhập trải nghiệm ngay ạ:

| Phân hệ | Vai trò (Role) | Email đăng nhập | Số điện thoại | Mật khẩu | Đường dẫn đăng nhập |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cổng Quản Trị** | `ADMIN` (Toàn quyền) | `admin@vela.com` *(hoặc `admin@gmail.com`)* | `0901234560` | `Password123!` | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **Cổng Quản Trị** | `RECEPTIONIST` (Lễ tân) | `letan@vela.com` *(hoặc `letan@gmail.com`)* | `0901234561` | `Password123!` | [http://localhost:3000/admin/login](http://localhost:3000/admin/login) |
| **Website Khách Hàng** | `CUSTOMER` (Khách hàng) | `minhanh@example.com` *(hoặc `thuha@example.com`)* | `0910000001` | `Password123!` | [http://localhost:3000/account/login](http://localhost:3000/account/login) |

> **Hỗ trợ phiên đăng nhập kép (Dual-Session):** Hệ thống hỗ trợ đăng nhập đồng thời cả tài khoản **Khách hàng (`CUSTOMER`)** và tài khoản **Quản trị / Lễ tân (`ADMIN` / `RECEPTIONIST`)** trên cùng một trình duyệt mà không làm mất phiên đăng nhập của nhau.

---

## 🧭 Hướng Dẫn Sử Dụng & Kiểm Thử Các Chức Năng Trên Website

### Luồng 1: Trải nghiệm dành cho Khách hàng (`http://localhost:3000`)

1. **Khám phá Dịch vụ & Salon:**
   - Truy cập trang chủ [http://localhost:3000](http://localhost:3000).
   - Xem danh sách **Dịch vụ** (`/services`), bấm vào từng dịch vụ để xem chi tiết bảng giá, thời lượng và quy trình chăm sóc.
   - Xem hồ sơ **Chuyên viên / Kỹ thuật viên** (`/artists`) và **Bộ sưu tập mẫu móng / tóc (Lookbook)** (`/lookbook`).
2. **Đặt lịch hẹn trực tuyến (`/booking`):**
   - Bấm nút **"Đặt lịch"** trên thanh điều hướng (hoặc truy cập [http://localhost:3000/booking](http://localhost:3000/booking)).
   - **Bước 1 (Chọn dịch vụ):** Chọn một hoặc nhiều dịch vụ làm móng / chăm sóc sắc đẹp.
   - **Bước 2 (Chọn kỹ thuật viên & Ngày giờ):** Chọn kỹ thuật viên yêu thích, chọn ngày hẹn và khung giờ còn trống.
   - **Bước 3 (Thông tin & Mã giảm giá):** Nhập thông tin liên hệ (tự động điền nếu đã đăng nhập), áp dụng mã khuyến mãi (nếu có) và xác nhận đặt lịch.
   - Màn hình xác nhận sẽ trả về **Mã tra cứu lịch hẹn**.
3. **Tra cứu lịch hẹn & Quản lý tài khoản khách hàng (`/account`):**
   - Truy cập [http://localhost:3000/booking/lookup](http://localhost:3000/booking/lookup) để tra cứu lịch hẹn bằng số điện thoại / mã đặt lịch.
   - Hoặc đăng nhập tại [http://localhost:3000/account/login](http://localhost:3000/account/login) với tài khoản **`minhanh@example.com`** / **`Password123!`** (hoặc đăng ký tài khoản mới tại `/account/register`).
   - Tại trang `/account`, khách hàng có thể xem lịch sử cuộc hẹn, đổi giờ hẹn (Reschedule), hủy lịch, gửi đánh giá (Review) cho các lịch hẹn đã hoàn thành, cập nhật ảnh đại diện (Avatar) và đổi mật khẩu.

---

### Luồng 2: Trải nghiệm Cổng Quản Trị Salon (`http://localhost:3000/admin/login`)

1. **Kiểm thử quyền Quản trị viên (`ADMIN`):**
   - Truy cập [http://localhost:3000/admin/login](http://localhost:3000/admin/login) và đăng nhập bằng **`admin@vela.com`** / **`Password123!`**.
   - **Tổng quan & Báo cáo (`/admin/dashboard`, `/admin/reports`):** Theo dõi doanh thu, thống kê lịch hẹn và các thông báo cần chú ý.
   - **Lịch biểu & Quản lý Lịch hẹn (`/admin/calendar`, `/admin/appointments`):** Tạo lịch hẹn cho khách vãng lai, cập nhật trạng thái lịch hẹn (`PENDING` → `CONFIRMED` → `COMPLETED` / `CANCELLED`) và ghi nhận thanh toán.
   - **Dịch vụ & Danh mục (`/admin/services`, `/admin/categories`):** Thêm mới, chỉnh sửa, tìm kiếm, lọc và xóa mềm dịch vụ / danh mục.
   - **Khách hàng, Nhân sự & Danh sách chờ (`/admin/customers`, `/admin/staff`, `/admin/waitlist`):** Quản lý hồ sơ khách hàng, lịch làm việc của kỹ thuật viên và danh sách chờ.
   - **Kho hàng, Khuyến mãi & Đánh giá (`/admin/inventory`, `/admin/promotions`, `/admin/reviews`):** Quản lý sản phẩm, xuất/nhập tồn kho, mã giảm giá (Coupons) và duyệt đánh giá khách hàng.
   - **Quản lý Tài khoản & Phân quyền (`/admin/users`):** Thêm/sửa/xóa người dùng, gán vai trò (`ADMIN`, `RECEPTIONIST`, `STAFF`, `CUSTOMER`), tải ảnh đại diện, cấp lại mật khẩu và khóa/mở khóa tài khoản.
   - **Thùng rác (`/admin/trash`):** Khôi phục các dữ liệu đã xóa mềm.
2. **Kiểm thử phân quyền Lễ tân (`RECEPTIONIST`):**
   - Đăng xuất tài khoản Admin và đăng nhập lại tại [http://localhost:3000/admin/login](http://localhost:3000/admin/login) bằng tài khoản **`letan@vela.com`** / **`Password123!`**.
   - Kiểm tra cơ chế phân quyền (RBAC): Lễ tân được phép thao tác các nghiệp vụ quầy tiếp tân (Lịch hẹn, Lịch biểu, Khách hàng, Danh sách chờ), nhưng các chức năng quản trị cấp cao (như Quản lý User `/admin/users`) sẽ tự động bị ẩn trên menu và bị chặn truy cập (`403 Forbidden`) từ phía Backend API.

---

## 🧪 Chạy Kiểm Thử Tự Động (Automated Tests)

- **Chạy bộ kiểm thử Backend (Unit & Integration Tests):**
  ```powershell
  cd Java-Huy-Tuyet-24E
  .\mvnw.cmd test
  ```
- **Kiểm tra Lint & Build sản phẩm Frontend:**
  ```powershell
  cd frontend
  npm run lint
  npm run build
  ```

---

## 🙏 Lời Cảm Ơn

> **Dạ vâng, nhóm bọn em (Phạm Hồng Gia Huy và Lê Võ Hồng Tuyết) xin chân thành cảm ơn Thầy/Cô đã dành thời gian quý báu để chấm bài và trải nghiệm trang web của bọn em ạ!**  
> Kính chúc Thầy/Cô luôn dồi dào sức khỏe, nhiều niềm vui và công tác tốt ạ! ❤️
