import { TrashWorkspace } from "@/components/admin/trash-workspace";

export const metadata = {
  title: "Thùng rác tổng — VELA",
  description: "Quản lý và khôi phục các mục đã xóa trong hệ thống salon VELA.",
};

export default function TrashPage() {
  return <TrashWorkspace />;
}
