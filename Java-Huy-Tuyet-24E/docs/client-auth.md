# Tài khoản khách hàng

Frontend tiếp tục dùng JS/JSX, component `components/client-auth.jsx` và ba route:

| Trang | Chức năng |
| --- | --- |
| `/` | Trang chào khách, liên kết đăng ký/đăng nhập/tài khoản |
| `/register` | Họ tên, email, SĐT tùy chọn, mật khẩu và xác nhận mật khẩu |
| `/login` | Đăng nhập CUSTOMER |
| `/account` | Hiển thị họ tên/email của phiên thực và đăng xuất |

Đăng ký thành công hiển thị xác nhận và link sang Login, không tự đăng nhập.
`/account` chưa đăng nhập sẽ chuyển về `/login`. Không lưu mật khẩu hoặc thông
tin phiên trong localStorage. Lỗi kết nối có nút thử lại; thông tin tài khoản
được tải lại khi trang/cửa sổ được focus.

## API

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/api/auth/client/register` | Công khai, cần CSRF |
| POST | `/api/auth/client/login` | Công khai, chỉ xác thực CUSTOMER, cần CSRF |
| GET | `/api/auth/me` | Phiên đang đăng nhập, chỉ trả thông tin chính mình |
| POST | `/api/auth/logout` | Hủy phiên hiện tại, cần CSRF |

Body đăng ký: `fullName`, `email`, `phone` (tùy chọn), `password`. DTO công khai
không có role/status/passwordHash; server tự gán CUSTOMER và ACTIVE. Dùng bảng
users hiện có, không tạo bảng tài khoản mới. Mật khẩu bắt buộc từ 8 ký tự, tối
đa 72 byte UTF-8 và lưu BCrypt. Email chuẩn hóa chữ thường; email/SĐT trùng trả
409, dữ liệu không hợp lệ trả 400. Email đã thuộc hồ sơ chưa có mật khẩu cũng
bị từ chối đăng ký; không tự cấp mật khẩu/chiếm hồ sơ đã tồn tại.

Body đăng nhập: `email`, `password`. Sai thông tin hoặc tài khoản khóa trả 401.
Khóa tài
khoản, đổi mật khẩu hoặc xóa User vô hiệu phiên cũ ở request kế tiếp.

Phiên dùng cookie HttpOnly JSESSIONID, đổi ID khi login, SameSite=Lax và CSRF.
Trước request ghi, GET `/api/auth/csrf` rồi gửi header được trả về cùng cookie.
Registration trả 201 AuthResponse (không có hash/mật khẩu); login và me trả 200;
logout trả 204. Không có email xác thực/quên mật khẩu trong bước này.

## Tách với quản trị

CUSTOMER được đọc thông tin phiên của chính mình; không được đọc/sửa User,
Role, catalog quản trị, avatar quản trị hoặc các endpoint nghiệp vụ chưa cấp.
Login `/api/auth/login` vẫn chỉ dành cho ADMIN/RECEPTIONIST/STAFF; khách gọi sẽ
nhận 403. Tài khoản nội bộ gọi client login cũng nhận 403 và được hướng dẫn
đăng nhập `/admin/login`.

Hai giao diện dùng cùng một phiên backend trên cùng trình duyệt: đăng nhập tài
khoản khác sẽ thay phiên hiện tại, logout ảnh hưởng cả hai khu vực. Khi khách
mở `/admin/login`, frontend không coi phiên CUSTOMER là phiên quản trị và
không chuyển vòng lặp. Tài khoản nội bộ mở `/login`, `/register` hoặc `/account`
thấy link về quản trị và nút đăng xuất trước khi dùng tài khoản khách.

## Kiểm thử

`ClientAuthIntegrationTests` chạy H2, kiểm tra đăng ký thật, BCrypt, chuẩn hóa,
chống tự gán role, dữ liệu sai/trùng, không chiếm hồ sơ cũ, CSRF, giới hạn quyền,
login/logout, khóa tạm và thu hồi phiên. Chạy cùng toàn bộ test backend:

```powershell
.\mvnw.cmd test "-Dspring.profiles.active=test"
cd frontend
npm run lint
npm run build
```
