import { RouteMessage } from "@/components/website/route-message";
export const metadata = { title: "Không tìm thấy trang" };
export default function WebsiteNotFound() {
  return (
    <RouteMessage
      eyebrow="Lỗi 404"
      lines={["NỘI DUNG NÀY", "KHÔNG CÒN NỮA."]}
      description="Dịch vụ hoặc nhân viên bạn tìm có thể đã ngừng hoạt động. Danh sách bên dưới luôn là bản mới nhất."
      actions={[
        { label: "Tất cả dịch vụ", href: "/services", primary: true },
        { label: "Đội ngũ nhân viên", href: "/artists" },
        { label: "Về trang chủ", href: "/" },
      ]}
    />
  );
}
