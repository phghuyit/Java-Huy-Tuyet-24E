import { AdminShell } from "@/components/admin/admin-shell";
export const metadata = {
  title: { default: "Quản trị salon", template: "%s — VELA" },
  description: "Quản lý lịch hẹn và hoạt động salon VELA.",
  robots: { index: false, follow: false },
};
export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
