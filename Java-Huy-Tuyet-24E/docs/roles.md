# User Role

Mỗi User có một Role qua `users.role_id` → `roles.id` theo ERD.

Backend tự tạo các role còn thiếu khi khởi động, kể cả khi seed dữ liệu mẫu tắt:

| Code | Tên |
| --- | --- |
| ADMIN | Quản trị viên |
| RECEPTIONIST | Lễ tân |
| STAFF | Nhân viên |
| CUSTOMER | Khách hàng |

Không hard-code ID: lấy ID thực tế bằng `GET /api/roles`.
`GET /api/roles/{id}` trả một role; ID không tồn tại trả 404, ID <= 0 trả 400.

## Gán role cho User

`POST /users` nhận thêm `roleId` tùy chọn:

```json
{
  "fullName": "Nguyễn Minh Anh",
  "email": "minhanh@example.com",
  "phone": "0910000001",
  "roleId": 3
}
```

Số 3 chỉ minh họa, cần thay bằng ID từ API role.
Không truyền hoặc truyền null: tạo User với role CUSTOMER.
`PUT /users/{id}` nhận cùng các trường trên; không truyền hoặc truyền null
cho roleId thì giữ role hiện tại. Role không tồn tại trả 404; ID <= 0 trả 400.
Response User có thêm `roleId`, `roleCode`, `roleName`, không trả passwordHash.

User cũ chưa có role được bổ sung CUSTOMER khi khởi động; role đã gán được giữ nguyên.
Hibernate `ddl-auto: update` thêm bảng roles và cột role_id khi chạy với MySQL.
Cột role_id cho phép null để thêm được vào bảng users đã có dữ liệu; initializer
bổ sung dữ liệu cũ và service luôn gán role khi tạo User qua API.

Login đã dùng Spring Security và phiên backend. API quản lý User/gán role và
API đọc Role chỉ dành cho ADMIN. Xem [hướng dẫn Login](login.md).
Frontend đã có ô chọn Role trong form tạo/sửa User và bộ lọc Role ở danh sách.
Xem [quản lý User và tài khoản](users.md) để cấp mật khẩu và khóa/mở tài khoản.

## Phân quyền hiện tại

| Chức năng | ADMIN | RECEPTIONIST | STAFF |
| --- | --- | --- | --- |
| User, cấp mật khẩu, gán Role, khóa/mở, avatar | Toàn quyền | Không | Không |
| Đọc Role | Có | Không | Không |
| Đọc danh sách/chi tiết dịch vụ và danh mục qua API | Có | Có | Có |
| Thêm/sửa/xóa dịch vụ và danh mục qua API | Có | Không | Không |
| Màn lịch hẹn mẫu | Có | Có | Không |
| Màn danh mục/thương hiệu mẫu, khôi phục dữ liệu mẫu | Có | Không | Không |

CUSTOMER không được đăng nhập khu vực quản trị. GET/HEAD catalog được cấp cho
ba role nội bộ; POST/PUT/DELETE catalog chỉ ADMIN. API hoặc method chưa khai
báo sẽ bị từ chối mặc định, kể cả ADMIN. Logout vẫn dùng POST với CSRF.
Chưa đăng nhập trả 401; có phiên nhưng thiếu quyền trả 403 `FORBIDDEN`.
Backend kiểm tra lại role mỗi request nên hạ quyền có hiệu lực ngay trên phiên cũ.

Frontend dùng cùng ma trận trong `navigation.js`: ẩn menu, nút ghi và chặn mở
trực tiếp URL không có quyền trước khi render nội dung. Sau đăng nhập, ADMIN
vào User, Lễ tân vào lịch hẹn mẫu, STAFF vào dịch vụ chỉ xem. Tham số `next`
chỉ được dùng nếu đúng trang được phép. Khi API từ chối quyền, frontend tải lại
thông tin phiên; đây là hỗ trợ giao diện, quyền API vẫn được kiểm tra ở backend.

Lịch hẹn hiện dùng dữ liệu mẫu localStorage, chưa có endpoint thực trong
AppointmentController. Chưa cấp STAFF xem toàn bộ lịch mẫu; cần API lọc theo
nhân viên đăng nhập trước khi mở chức năng lịch của tôi/cập nhật tiến độ.
Chưa có module khách hàng riêng cho Lễ tân; không dùng quyền User để thay thế
vì API User còn cho cấp mật khẩu và gán role.

## Kiểm thử

```powershell
.\mvnw.cmd test "-Dspring.profiles.active=test"
```

Profile test dùng H2, không ghi vào MySQL.
RolePermissionsIntegrationTests kiểm tra quyền đọc/ghi bằng HTTP thực, multipart
User, logout, dữ liệu không đổi khi bị từ chối, hạ quyền trên phiên đang dùng
và từ chối API/method chưa khai báo. Bộ CRUD hiện có kiểm tra ADMIN vẫn ghi được.
