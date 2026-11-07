import { AccountDashboard } from "@/components/website/account/account-dashboard";
export const metadata = {
  title: "Tài khoản",
  description: "Lịch hẹn, điểm tích lũy và thông tin liên hệ của bạn tại VELA.",
  robots: { index: false, follow: false },
};
export default function AccountPage() {
  return <AccountDashboard />;
}
