import { RouteMessage } from "@/components/website/route-message";
export const metadata = { title: "Không tìm thấy trang" };
export default function NotFound() {
  return (
    <div className="bg-ivory text-ink">
      <RouteMessage
        standalone
        eyebrow="Lỗi 404"
        lines={["KHÔNG TÌM THẤY", "TRANG NÀY."]}
        description="Đường dẫn bạn mở không tồn tại hoặc đã được đổi. Có thể bắt đầu lại từ những trang dưới đây."
        actions={[
          { label: "Về trang chủ", href: "/", primary: true },
          { label: "Xem dịch vụ", href: "/services" },
          { label: "Đặt lịch", href: "/booking" },
        ]}
        footnote="Nếu bạn vừa bấm một liên kết trên website của chúng tôi, hãy báo lại cho salon qua 0901 000 888."
      />
    </div>
  );
}
