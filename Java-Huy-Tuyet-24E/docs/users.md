# Quản lý User và tài khoản

Trang `/admin/users` và API `/users` chỉ dành cho ADMIN. Cấu trúc frontend vẫn
dùng JavaScript/JSX, form HTML và `dialog` hiện có, không thêm thư mục component.

## Các trường

Bảng `users` có 12 cột: `id`, `full_name`, `email`, `phone`, `avatar_url`,
`status`, `role_id`, `password_hash`, `failed_attempts`, `locked_until`,
`created_at`, `updated_at`. Hibernate `ddl-auto: update` thêm hai cột chống đăng
nhập sai khi backend khởi động; các bản ghi cũ có `failed_attempts = 0`.

`POST /users` và `PUT /users/{id}` nhận:

| Trường | Quy tắc |
| --- | --- |
| fullName | Bắt buộc, 1–150 ký tự sau khi bỏ khoảng trắng đầu/cuối |
| email | Bắt buộc, tối đa 255 ký tự, chuẩn hóa chữ thường, không trùng |
| phone | Tùy chọn; trống/null lưu null. Nếu có phải là SĐT Việt Nam và không trùng |
| roleId | Tạo mới mặc định CUSTOMER; khi sửa, bỏ qua/null giữ role hiện tại |
| password | Tùy chọn. Ít nhất 8 ký tự, tối đa 72 byte UTF-8; lưu BCrypt |
| status | ACTIVE hoặc LOCKED; tạo mới mặc định ACTIVE, sửa bỏ qua giữ trạng thái cũ |
| avatarUrl | Đường dẫn ảnh đã upload hoặc URL http/https tối đa 255 ký tự (tương thích API cũ) |
| unlockLogin | Chỉ dùng khi sửa; true xóa số lần sai và khóa tạm |

Khi sửa, password bị bỏ qua/null/chuỗi rỗng giữ nguyên mật khẩu cũ; chuỗi chỉ có
khoảng trắng không hợp lệ. Cấp lại mật khẩu xóa khóa tạm và vô hiệu phiên cũ
trên request tiếp theo. Nếu đang sửa mật khẩu của chính mình, phải đăng nhập lại.
User không có mật khẩu vẫn là hồ sơ, không thể đăng nhập. CUSTOMER dùng trang
`/login` và `/register`; Login quản trị chỉ cho ADMIN/RECEPTIONIST/STAFF.
Xem [tài khoản khách hàng](client-auth.md).

Khi sửa, avatarUrl bị bỏ qua/null giữ ảnh cũ; chuỗi rỗng xóa ảnh. Giao diện dùng
nút Chọn ảnh từ máy và Xóa ảnh, không cần nhập URL.

## Tải ảnh đại diện

Form cho chọn JPG/PNG tối đa 2 MB, xem trước và lưu ảnh cùng thông tin User.
Ảnh cũng hiển thị trong danh sách. Hủy form không tải ảnh lên server.

Khi có ảnh mới, POST `/users` hoặc PUT `/users/{id}` nhận `multipart/form-data`:
part `user` có Content-Type `application/json` chứa dữ liệu như bảng trên;
part `avatar` chứa file. Không có ảnh mới thì gửi JSON như trước. Các request
ghi vẫn cần phiên ADMIN và CSRF token.

Backend kiểm tra nội dung ảnh thực tế, loại PNG/JPEG và kích thước tối đa
4096 × 4096; cắt giữa thành hình vuông, thu nhỏ tối đa 512 × 512 rồi ghi PNG
với tên UUID. File sai trả 400, quá 2 MB trả 413. Nếu lưu User thất bại, ảnh
mới được dọn; đổi/xóa ảnh hoặc xóa User sẽ dọn ảnh cũ sau khi transaction
thành công nếu không còn User khác tham chiếu.

Ảnh lưu tại `./uploads/avatars` (được bỏ qua bởi Git); có thể đổi bằng biến
`AVATAR_UPLOAD_DIR`. Cần lưu bền và sao lưu thư mục này cùng database khi triển
khai. API GET `/api/avatars/{filename}` yêu cầu đăng nhập quản trị và trả ảnh
PNG; `avatarUrl` trong response là đường dẫn `/api/avatars/...png`.

Response có thêm roleCode, roleName, status, avatarUrl, hasPassword,
failedAttempts, lockedUntil, temporarilyLocked, createdAt, updatedAt.
`hasPassword` chỉ là boolean; không có API trả mật khẩu thô hoặc passwordHash.
ID, timestamp, số lần sai và thời điểm khóa tạm do backend quản lý.

## Khóa thủ công và khóa tạm

- LOCKED là khóa thủ công: không được đăng nhập và phiên cũ hết hiệu lực trên
  request kế tiếp. Chuyển về ACTIVE sẽ đồng thời xóa số lần sai/khóa tạm.
- Sau 5 lần sai mật khẩu liên tiếp, `locked_until` được đặt sau 15 phút;
  `status` vẫn ACTIVE. Trong thời gian này mật khẩu đúng cũng không đăng nhập được.
- Hết thời gian khóa, có thể thử lại; lần sai đầu tiên bắt đầu lại từ 1.
  Đăng nhập đúng sẽ xóa bộ đếm và `locked_until`.
- ADMIN có thể bấm Mở khóa trên bảng hoặc chọn xóa khóa tạm trong form sửa.
- Không tăng bộ đếm của tài khoản không tồn tại, chưa có mật khẩu, khóa thủ công
  hoặc đang khóa tạm. Counter được cập nhật bằng khóa hàng trong transaction.
- Giới hạn được cấu hình trong `app.auth.max-failed-attempts` và
  `app.auth.lock-minutes` ở application.yaml.

Backend từ chối khóa, hạ quyền hoặc xóa ADMIN ACTIVE có mật khẩu cuối cùng
(409). Khóa hàng các ADMIN trước khi kiểm tra để tránh hai yêu cầu đồng thời
cùng xóa quyền quản trị cuối cùng. Form cũng không cho xóa tài khoản đang sử dụng.

## Giao diện

Danh sách có bộ lọc Role/trạng thái và tìm theo tên/email/SĐT/Role. Mỗi dòng
hiển thị Role, trạng thái, đã cấp mật khẩu hay chưa, số lần sai, khóa tạm và ngày
tạo. Form sửa hiển thị thêm ngày cập nhật. Nút Khóa/Mở khóa gọi API thực.
Form tải Role từ `/api/roles`, không dùng ID hoặc dữ liệu mẫu cố định.

## Kiểm thử

```powershell
.\mvnw.cmd clean test "-Dspring.profiles.active=test"
cd frontend
npm run lint
npm run build
```

UserAccountIntegrationTests kiểm tra mật khẩu mã hóa, giữ/cấp lại mật khẩu,
hủy phiên, khóa/mở thủ công, khóa tạm, hết thời gian khóa, dữ liệu không hợp lệ,
metadata response và ADMIN cuối cùng. Test backend dùng H2 riêng.
AvatarApiIntegrationTests dùng thư mục tạm riêng, kiểm tra upload, đọc ảnh,
đổi/xóa ảnh, rollback, quyền truy cập và từ chối file không hợp lệ.
