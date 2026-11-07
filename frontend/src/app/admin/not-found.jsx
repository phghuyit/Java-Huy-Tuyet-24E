import Link from "next/link";
import { AdminPage } from "@/components/admin/layout-kit";
import { Button } from "@/components/ui/button";
export default function AdminNotFound() {
  return (
    <AdminPage
      eyebrow="Lỗi 404"
      title="Không tìm thấy trang"
      description="Mục này không tồn tại, hoặc bản ghi đã bị xóa khỏi hệ thống."
    >
      <div className="flex flex-wrap gap-3 border-t border-paper/10 pt-8">
        <Button asChild variant="champagne" size="lg">
          <Link href="/admin/dashboard">Về tổng quan</Link>
        </Button>
        <Button asChild variant="outlineLight" size="lg">
          <Link href="/admin/appointments">Danh sách lịch hẹn</Link>
        </Button>
      </div>
    </AdminPage>
  );
}
