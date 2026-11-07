# VELA — Salon & Spa Web Platform (JavaScript)

Giao diện frontend hoàn chỉnh chuyển đổi từ `template/vela-salon`, sử dụng thuần **JavaScript / JSX** (không dùng TypeScript), Next.js App Router và Tailwind CSS v4.

## Cấu trúc hệ thống

- **Website khách hàng:**
  - Trang chủ (`/`): Hero, VELA Signatures, Nghệ sĩ/Stylists, Mood Grid, Bộ sưu tập, Đánh giá khách hàng.
  - Khám phá dịch vụ (`/services` & `/services/[slug]`): Danh mục Cắt tóc, Nhuộm, Móng, Nối mi, Chăm sóc da, Head Spa.
  - Quy trình đặt lịch (`/booking`, `/booking/lookup`, `/booking/success`): Chọn dịch vụ, chọn chuyên viên, chọn ngày giờ và xác nhận cuộc hẹn.
  - Chuyên viên làm đẹp (`/artists` & `/artists/[slug]`): Hồ sơ nhân viên, chuyên môn, portfolio và đặt lịch trực tiếp.
  - Bộ sưu tập phong cách (`/lookbook`): Thư viện ảnh kiểu tóc, móng và biến đổi phong cách.
  - Cổng khách hàng (`/account`, `/account/login`, `/account/register`): Xem lịch sử cuộc hẹn, đặt lại lịch, đổi mật khẩu.
  - Thông tin & Liên hệ: `/about`, `/contact`, `/faq`.

- **Cổng quản trị Salon (`/admin`):**
  - Đăng nhập / Đổi mật khẩu (`/admin/login`, `/admin/forgot-password`).
  - Lịch hẹn & Bàn tiếp tân (`/admin/calendar`, `/admin/appointments`): Quản lý khung giờ, kéo thả lịch hẹn, tiếp nhận thanh toán.
  - Dịch vụ & Danh mục (`/admin/services`, `/admin/categories`).
  - Khách hàng & Nhân viên (`/admin/customers`, `/admin/staff`): Hồ sơ khách, ca làm việc, ngày nghỉ của thợ.
  - Danh sách chờ (`/admin/waitlist`).
  - Khuyến mãi & Đánh giá (`/admin/promotions`, `/admin/reviews`).
  - Báo cáo & Thống kê (`/admin/reports`, `/admin/dashboard`).

## Hướng dẫn chạy dự án

1. Cài đặt các gói phụ thuộc (nếu chưa):
   ```powershell
   npm install
   ```

2. Khởi động môi trường phát triển:
   ```powershell
   npm run dev
   ```

   Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

3. Kiểm tra mã nguồn & build sản phẩm:
   ```powershell
   npm run lint
   npm run build
   ```
