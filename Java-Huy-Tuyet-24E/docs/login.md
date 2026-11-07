# Đăng nhập thật

Frontend dùng JavaScript/JSX và giữ cấu trúc thư mục hiện tại. Màn `/admin/login`
chuyển bố cục từ `D:/vela-salon` sang `components/admin/auth-panel.jsx` và
`auth-form.jsx`. Font Cormorant Garamond/Geist và ảnh salon dùng theo mẫu.
Không sao chép store đăng nhập mô phỏng hoặc cây thư mục TypeScript của mẫu.

## Tạo tài khoản quản trị lần đầu

Các User cũ là hồ sơ và chưa có mật khẩu; không tự chuyển thành tài khoản đăng nhập.
Ở PowerShell tại thư mục gốc, đặt cấu hình bằng email/SĐT **chưa được sử dụng**:

```powershell
$env:BOOTSTRAP_ADMIN_ENABLED = "true"
$env:BOOTSTRAP_ADMIN_EMAIL = "email-quan-tri-cua-ban@example.com"
$env:BOOTSTRAP_ADMIN_PHONE = "0901234567"
$env:BOOTSTRAP_ADMIN_NAME = "Quản trị VELA"
$env:BOOTSTRAP_ADMIN_PASSWORD = Read-Host "Mật khẩu quản trị (ít nhất 8 ký tự)" -MaskInput
.\mvnw.cmd spring-boot:run
```

Mật khẩu được mã hóa BCrypt, tối đa 72 byte UTF-8. Không lưu mật khẩu vào Git.
Initializer chạy sau khi tạo các Role, chỉ tạo ADMIN khi email chưa có.
Nếu email đã thuộc ADMIN có mật khẩu, khởi động lại không đổi mật khẩu/role.
Nếu email đã thuộc hồ sơ khác hoặc SĐT đã có, backend báo lỗi cấu hình thay vì
ghi đè dữ liệu. Sau lần tạo thành công có thể tắt BOOTSTRAP_ADMIN_ENABLED và
xóa BOOTSTRAP_ADMIN_PASSWORD khỏi môi trường; tài khoản vẫn nằm trong MySQL.

Sau đó chạy frontend như cũ và mở `http://localhost:3000/admin/login`:

```powershell
cd frontend
npm run dev
```

Backend mặc định `http://localhost:8080`; frontend dùng NEXT_PUBLIC_API_URL.
CORS dùng FRONTEND_URL, mặc định `http://localhost:3000`. Dùng cùng hostname
cho hai phía (localhost/localhost), không trộn localhost với 127.0.0.1.
Khi triển khai HTTPS, đặt SESSION_COOKIE_SECURE=true.

## API và phiên đăng nhập

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | /api/auth/csrf | Trả token/header CSRF và thiết lập cookie phiên nếu cần |
| POST | /api/auth/login | Nhận email/password, xác thực database và tạo phiên |
| GET | /api/auth/me | Trả id, name, email, roleId, roleCode, roleName của phiên |
| POST | /api/auth/logout | Hủy phiên, xóa cookie, trả 204 |

Login nhận JSON `{"email":"...","password":"..."}`. Email được trim và
so sánh không phân biệt hoa thường; mật khẩu giữ nguyên ký tự đã nhập.
Thông tin sai, tài khoản bị khóa hoặc hồ sơ chưa có mật khẩu trả 401 với cùng
thông báo chung. Email/mật khẩu sai định dạng trả 400. CUSTOMER không được vào
Login quản trị (403); ADMIN, RECEPTIONIST, STAFF có thể vào.

Cookie JSESSIONID là HttpOnly, SameSite=Lax; session hết hạn sau 30 phút không
hoạt động. Login đổi ID phiên và CSRF token. Không lưu mật khẩu/token đăng nhập
vào localStorage/sessionStorage. Frontend khôi phục User từ `/api/auth/me` khi
tải trang và kiểm tra lại khi cửa sổ được focus. Lỗi 401 đưa về Login; lỗi mạng
có nút thử lại. Đường dẫn `next` chỉ nhận các màn quản trị hiện có.

Các request ghi (POST/PUT/DELETE), kể cả Login/Logout, phải lấy CSRF token từ
GET /api/auth/csrf trước rồi gửi trong X-CSRF-TOKEN, kèm cookie phiên.
`frontend/src/lib/api.js` thực hiện việc này và dùng `credentials: include`.

API quản trị yêu cầu đăng nhập; chỉ ADMIN được gọi `/users` và `/api/roles`.
API dịch vụ/danh mục cho ba role đọc, chỉ ADMIN được thêm/sửa/xóa; các API mới
phải khai báo quyền cụ thể. Xem [ma trận quyền](roles.md). Tài khoản bị khóa/xóa hoặc đổi role được kiểm
tra lại trên request tiếp theo, không giữ quyền cũ đến hết phiên.

ADMIN đã có thể cấp/cấp lại mật khẩu qua form và API User, kèm Role và trạng
ADMIN có thể mở khóa sớm. Xem [quản lý User và tài khoản](users.md).
Khách hàng đã có [đăng ký/đăng nhập riêng](client-auth.md) tại `/register` và
`/login`. Chưa có chức năng quên mật khẩu.

## Kiểm thử

```powershell
.\mvnw.cmd test "-Dspring.profiles.active=test"
cd frontend
npm run lint
npm run build
```

Test backend dùng H2 riêng và tài khoản test trong application-test.yaml,
không tạo tài khoản test trong MySQL. Bao gồm đăng nhập đúng/sai, khóa/xóa/đổi
role khi đã đăng nhập, BCrypt, CSRF, CORS, đổi ID phiên, Logout và CRUD.

Để chạy bộ test User/Role trên một backend đang chạy, dùng ADMIN thực của môi
trường đó (script chỉ sửa/xóa User do chính lần chạy tạo ra):

```powershell
$env:API_TEST_EMAIL = "email-quan-tri-cua-ban@example.com"
$env:API_TEST_PASSWORD = Read-Host "Mật khẩu quản trị" -MaskInput
node test-data/test-user-role-api.mjs
```

Script lưu kết quả ở test-data/latest-user-role-api-results.json; không lưu
mật khẩu hoặc cookie vào báo cáo. Sau khi chạy có thể xóa API_TEST_PASSWORD
khỏi môi trường của cửa sổ PowerShell.
