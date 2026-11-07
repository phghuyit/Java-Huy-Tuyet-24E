# Báo cáo công việc đã thực hiện

**Dự án:** Java-Huy-Tuyet-24E  
**Cập nhật:** 16/10/2026  
**Phạm vi:** User, Role, đăng nhập/đăng xuất, avatar, phân quyền và tài khoản khách hàng.

## 1. Tiến độ tổng quan

| Hạng mục | Kết quả hiện tại |
| --- | --- |
| Role | Có 4 role; User được gán role từ database |
| User | Thêm, xem, sửa, xóa; cấp mật khẩu; khóa/mở; tìm kiếm và lọc |
| Login/Logout quản trị | Xác thực thật bằng database và phiên backend |
| Avatar User | Chọn ảnh từ máy, xem trước, đổi/xóa và lưu file thật |
| Phân quyền | Kiểm tra tại API; ẩn menu/nút và chặn URL ngoài quyền ở frontend |
| Tài khoản nội bộ | Đã có ADMIN, STAFF và Lễ tân trong MySQL |
| Khách hàng | Đã có đăng ký, đăng nhập, trang tài khoản và đăng xuất thật |
| Kiểm thử | Lần chạy cuối: 57 test backend đạt; frontend lint/build đạt |

Frontend tiếp tục dùng **JavaScript/JSX**, Next.js và cấu trúc gọn. User và
dịch vụ dùng API thật. Lịch hẹn, trang danh mục và thương hiệu trên giao diện
quản trị vẫn dùng dữ liệu mẫu; không coi các màn này là nghiệp vụ hoàn chỉnh.

## 2. Các task và file tác động

Để bảng gọn, các đường dẫn bên dưới tính từ thư mục dự án:

- **BE:** `src/main/java/com/example/booking_nail/`
- **FE:** `frontend/src/`
- **TEST:** `src/test/java/com/example/booking_nail/`

### Task 1 — Tạo Role và gán Role cho User

**Đã làm:** Tạo ADMIN, RECEPTIONIST, STAFF, CUSTOMER; liên kết `users.role_id`
với `roles.id`. Bổ sung CUSTOMER cho hồ sơ cũ chưa có role. Tạo User mặc định
CUSTOMER; sửa có thể đổi role. Có API đọc danh sách/chi tiết role, kiểm tra ID
và không dùng ID role cố định trên giao diện.

**File tác động:**

- BE: `entity/Role.java`, `entity/User.java`.
- BE: `repository/RoleRepository.java`, `repository/UserRepository.java`.
- BE: `service/RoleService.java`, `service/UserService.java`.
- BE: `controller/RoleController.java`, `controller/UserController.java`.
- BE: `config/RoleDataInitializer.java`, `config/UserDataInitializer.java`.
- BE: `dto/request/UserCreationRequest.java`, `dto/request/UserUpdateRequest.java`, `dto/response/UserResponse.java`.
- FE: `components/admin/users.jsx`.
- TEST: `RoleApiIntegrationTests.java`, `config/UserDataInitializerTests.java`.
- Tài liệu: `docs/roles.md`.

### Task 2 — Login/Logout quản trị thật

**Đã làm:** Thay đăng nhập mô phỏng bằng xác thực database. Mật khẩu mã hóa
BCrypt; phiên dùng cookie HttpOnly, CSRF và đổi ID phiên khi login. Có API lấy
người đang đăng nhập, khôi phục phiên khi tải lại và hủy phiên khi logout.
Tài khoản bị khóa/xóa/đổi mật khẩu không giữ được phiên cũ; đổi role được kiểm
tra lại trên request tiếp theo. Cấu hình CORS cho frontend gọi backend.

**File tác động:**

- BE: `controller/AuthController.java`, `service/AuthService.java`.
- BE: `dto/request/LoginRequest.java`, `dto/response/AuthResponse.java`.
- BE: `config/SecurityConfig.java`, `config/AccountSessionFilter.java`, `config/WebConfig.java`, `config/AdminAccountInitializer.java`.
- Cấu hình: `pom.xml`, `src/main/resources/application.yaml`.
- FE: `lib/api.js`, `components/admin/admin-provider.jsx`, `components/admin/admin-shell.jsx`.
- FE: `components/admin/auth-form.jsx`, `components/admin/auth-panel.jsx`, `app/admin/login/page.jsx`, `app/admin/layout.jsx`.
- TEST: `AuthApiIntegrationTests.java`, `AuthenticatedApiClient.java`; cấu hình `src/test/resources/application-test.yaml`.
- Tài liệu: `docs/login.md`.

### Task 3 — Hoàn thiện bảng và form User

**Đã làm:** Bổ sung luồng cấp/cấp lại mật khẩu, trạng thái ACTIVE/LOCKED,
thông tin role, avatar và thời gian tạo/cập nhật. SĐT được để trống; email/SĐT
không trùng. Không trả mật khẩu hoặc hash qua API. Form có tìm kiếm, lọc role,
lọc trạng thái và nút khóa/mở nhanh.

Login sai 5 lần khóa tạm 15 phút; ADMIN có thể mở khóa. Giữ mật khẩu cũ nếu
không nhập mật khẩu mới. Chặn khóa, hạ quyền hoặc xóa ADMIN hoạt động có mật
khẩu cuối cùng.

**Bảng `users` hiện có 12 cột:** `id`, `full_name`, `email`, `phone`,
`avatar_url`, `status`, `role_id`, `password_hash`, `failed_attempts`,
`locked_until`, `created_at`, `updated_at`.

**File tác động:**

- BE: `entity/User.java`, `repository/UserRepository.java`, `service/UserService.java`, `service/AuthService.java`.
- BE: `dto/request/UserCreationRequest.java`, `dto/request/UserUpdateRequest.java`, `dto/response/UserResponse.java`.
- BE: `controller/UserController.java`, `config/ApiExceptionHandler.java`, `config/AccountSessionFilter.java`.
- Cấu hình: `src/main/resources/application.yaml`.
- FE: `components/admin/users.jsx`.
- TEST: `UserAccountIntegrationTests.java`, `service/UserServiceTests.java`.
- Tài liệu: `docs/users.md`.

### Task 4 — Giao diện quản trị JS/JSX và dữ liệu API

**Đã làm:** Chuyển bố cục cần dùng từ mẫu VELA sang frontend hiện tại, giữ
component/form riêng cho từng màn. Có khung quản trị, menu, modal và thông báo.
User và NailService đọc/ghi API thật; form dịch vụ lấy categoryId từ database.
Lịch hẹn, danh mục và thương hiệu mẫu có nhãn phân biệt nguồn dữ liệu.

**File/nhóm file tác động:**

- FE: `app/layout.jsx`, `app/globals.css`, `app/page.jsx`; các route trong `app/admin/`.
- FE: `components/admin/admin-shell.jsx`, `admin-provider.jsx`, `navigation.js`, `users.jsx`, `nail-services.jsx`.
- FE: `components/admin/appointments.jsx`, `appointment-list.jsx`, `appointment-detail.jsx`, `booking-form.jsx`, `categories.jsx`, `brands.jsx`.
- FE: các component dùng chung trong `components/ui/`, dữ liệu mẫu trong `data/`, tiện ích `lib/api.js`, `lib/booking.js`, `lib/format.js`.
- Cấu hình frontend: `package.json`, `package-lock.json`, `next.config.mjs`, `postcss.config.mjs`, `eslint.config.mjs`, `jsconfig.json`, `.env.example`, `.gitignore` trong `frontend/`.
- BE: `config/UserDataInitializer.java`, `config/NailServiceDataInitializer.java` — giới hạn seed hồ sơ/dịch vụ mẫu trong profile test.
- Tài liệu: `frontend/README.md`. Bản mẫu được giữ trong `template/vela-salon/`.
- Sao lưu dữ liệu mẫu đã dọn trước đó: `backups/removed-api-seeds-2026-10-10.json`.

### Task 5 — Upload ảnh đại diện User

**Đã làm:** Thay nhập URL trên form bằng chọn JPG/PNG tối đa 2 MB; xem trước,
đổi/xóa ảnh và hiển thị trong danh sách. Gửi ảnh cùng thông tin User bằng một
request multipart. Backend kiểm tra nội dung ảnh, cắt vuông, thu nhỏ tối đa
512 × 512 và lưu PNG với tên UUID. Có dọn file khi rollback, thay/xóa avatar
hoặc xóa User; không xóa ảnh còn hồ sơ khác tham chiếu.

**File tác động:**

- BE: `service/AvatarService.java`, `controller/AvatarController.java`.
- BE: `controller/UserController.java`, `service/UserService.java`, `repository/UserRepository.java`, `config/ApiExceptionHandler.java`.
- FE: `components/admin/users.jsx`, `lib/api.js`.
- Cấu hình: `src/main/resources/application.yaml`, `.gitignore` ở gốc.
- TEST: `AvatarApiIntegrationTests.java`, `AuthenticatedApiClient.java`, `service/UserServiceTests.java`.
- Lưu trữ: `uploads/avatars/` hoặc đường dẫn từ `AVATAR_UPLOAD_DIR`; không đưa ảnh vào Git.
- Tài liệu: `docs/users.md`.

### Task 6 — Tách quyền ADMIN, Lễ tân và STAFF

**Đã làm:** Chặn quyền tại API theo đường dẫn/method, không chỉ ẩn nút.
Frontend lọc menu, nút ghi, trang chuyển đến sau login và tham số `next`.
API/method chưa khai báo quyền bị từ chối mặc định.

| Chức năng | ADMIN | RECEPTIONIST | STAFF | CUSTOMER |
| --- | --- | --- | --- | --- |
| Quản lý User/đọc Role | Có | Không | Không | Không |
| Đọc API dịch vụ/danh mục quản trị | Có | Có | Có | Không |
| Thêm/sửa/xóa dịch vụ/danh mục | Có | Không | Không | Không |
| Dùng màn lịch hẹn mẫu | Có | Có | Không | Không |
| Danh mục/thương hiệu mẫu, khôi phục mẫu | Có | Không | Không | Không |
| Login khách hàng, xem tài khoản của mình | Khu quản trị riêng | Khu quản trị riêng | Khu quản trị riêng | Có |

**File tác động:**

- BE: `config/SecurityConfig.java`.
- FE: `components/admin/navigation.js`, `admin-shell.jsx`, `auth-form.jsx`, `nail-services.jsx`, `admin-provider.jsx`; `lib/api.js`.
- TEST: `RolePermissionsIntegrationTests.java`.
- Tài liệu: `docs/roles.md`, `docs/login.md`, `frontend/README.md`.

### Task 7 — Tạo và điều chỉnh tài khoản trong MySQL

**Đã làm:** Tạo tài khoản quản trị, STAFF và Lễ tân; đổi email Lễ tân từ
`receptionist@gmail.com` thành `letan@gmail.com`, sau đó đổi mật khẩu theo yêu
cầu. Đã thử đăng nhập và quyền truy cập của từng tài khoản.

| Email hiện tại | Role | Trạng thái |
| --- | --- | --- |
| `admin@gmail.com` | ADMIN | ACTIVE |
| `staff@gmail.com` | STAFF | ACTIVE |
| `letan@gmail.com` | RECEPTIONIST | ACTIVE |

**Tác động:** Bản ghi trong bảng `users` của MySQL, thông qua API User.
Không tạo file chứa mật khẩu; thông tin đăng nhập đã gửi trong hội thoại.
`config/AdminAccountInitializer.java` phục vụ khởi tạo ADMIN lần đầu và không
tự ghi đè mật khẩu của ADMIN đã tồn tại.

### Task 8 — Đăng ký, đăng nhập và đăng xuất khách hàng

**Đã làm:** Có trang chào khách `/`, đăng ký `/register`, đăng nhập `/login`
và tài khoản `/account`. Đăng ký vào bảng User hiện có, luôn CUSTOMER/ACTIVE;
không nhận quyền do client tự gán. Kiểm tra dữ liệu trùng/sai và xác nhận mật
khẩu ở form. Không cho đăng ký chiếm hồ sơ đã tồn tại, kể cả hồ sơ chưa có mật khẩu.

Đăng ký thành công chuyển sang bước đăng nhập. Phiên khách dùng cookie/CSRF,
giữ sau tải lại, có logout và áp dụng khóa tạm như tài khoản nội bộ. Khách không
vào được API quản trị; hai cổng login kiểm tra đúng loại tài khoản. Hai giao
diện dùng chung phiên trong cùng trình duyệt, mỗi thời điểm một tài khoản.

**File tác động:**

- BE: `dto/request/CustomerRegistrationRequest.java`, `controller/AuthController.java`.
- BE: `config/SecurityConfig.java`, `config/AccountSessionFilter.java`.
- FE: `components/client-auth.jsx`, `app/register/page.jsx`, `app/login/page.jsx`, `app/account/page.jsx`.
- FE: `app/page.jsx`, `app/layout.jsx`, `app/admin/layout.jsx`, `components/admin/admin-provider.jsx`, `lib/api.js`.
- TEST: `ClientAuthIntegrationTests.java`.
- Tài liệu: `docs/client-auth.md`, `docs/login.md`, `docs/users.md`, `frontend/README.md`.

## 3. API chính đã có

| Method | Endpoint | Mục đích |
| --- | --- | --- |
| GET/POST | `/users` | Danh sách/thêm User, chỉ ADMIN |
| GET/PUT/DELETE | `/users/{id}` | Xem/sửa/xóa User, chỉ ADMIN |
| POST/PUT | `/users`, `/users/{id}` | Nhận thêm multipart nếu có avatar mới |
| GET | `/api/roles`, `/api/roles/{id}` | Đọc role; chưa có API tạo/sửa/xóa role |
| GET | `/api/auth/csrf` | Lấy token bảo vệ request ghi |
| POST | `/api/auth/login` | Login quản trị |
| POST | `/api/auth/client/register` | Đăng ký khách hàng |
| POST | `/api/auth/client/login` | Login khách hàng |
| GET | `/api/auth/me` | Thông tin tài khoản đang đăng nhập |
| POST | `/api/auth/logout` | Hủy phiên hiện tại |
| GET | `/api/avatars/{filename}` | Đọc avatar, chỉ role nội bộ |

API dịch vụ `/api/services` và danh mục `/api/categories` có CRUD thật;
quyền truy cập áp dụng theo bảng ở Task 6.

## 4. Kết quả kiểm thử

- **57 test backend đạt**, không lỗi/thất bại trong lần chạy cuối.
- **Frontend ESLint và production build đạt.**
- Bộ test User/Role gọi backend thực trước đó đạt **51 kiểm tra**; đây là bộ
  kiểm tra riêng, không cộng với 57 test Java.
- Đã thử giao diện: upload/xóa avatar; menu theo role; URL ngoài quyền;
  đăng ký → login khách → tải lại còn phiên → logout → chặn trang tài khoản.
- Kiểm thử tự động dùng H2 riêng. Tài khoản thử cho phân quyền và đăng ký
  trên trình duyệt dùng H2 tạm; hồ sơ avatar thử trong MySQL đã được dọn.

**File kiểm thử/báo cáo liên quan:**

- TEST: `AdminApiIntegrationTests.java`, `AuthApiIntegrationTests.java`, `RoleApiIntegrationTests.java`, `UserAccountIntegrationTests.java`.
- TEST: `AvatarApiIntegrationTests.java`, `RolePermissionsIntegrationTests.java`, `ClientAuthIntegrationTests.java`, `AuthenticatedApiClient.java`.
- TEST: `service/UserServiceTests.java`, `config/UserDataInitializerTests.java`; các test dự án có sẵn cũng được chạy cùng.
- `src/test/resources/application-test.yaml`.
- `test-data/test-user-role-api.mjs`, `test-data/latest-user-role-api-results.json`.

## 5. Phần chưa làm và hướng tiếp theo

1. **API lịch hẹn thật:** tạo/sửa/hủy, phân công nhân viên, kiểm tra giờ trống
   và tránh trùng lịch. `AppointmentController.java` hiện chưa có endpoint;
   mapper/entity/service sẵn có chưa tạo thành luồng API hoàn chỉnh.
2. **Lịch của STAFF:** chỉ xem lịch được phân công và cập nhật tiến độ. Hiện
   chưa mở màn lịch chung cho STAFF.
3. **Khách hàng cho Lễ tân:** cần module riêng, không dùng API User có quyền
   cấp mật khẩu/gán role để thay thế.
4. **Nối dữ liệu thật:** thay lịch hẹn mẫu; đồng bộ trang danh mục với API và
   làm API thương hiệu nếu nghiệp vụ cần.
5. **Tài khoản khách hàng nâng cao:** chưa có xác thực email, quên mật khẩu,
   sửa hồ sơ, tự đổi mật khẩu hoặc lịch hẹn cá nhân.

Các bước trên là việc tiếp theo, **chưa được tính là hoàn thành** trong báo cáo này.
