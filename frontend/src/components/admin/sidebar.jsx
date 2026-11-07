"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Rows3,
  Scissors,
  Users,
  UserRound,
  Tags,
  Clock,
  Star,
  Hourglass,
  BadgePercent,
  Send,
  LogOut,
  RotateCcw,
  Package,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import { can, ROLE_LABEL, scopedStaffId } from "@/lib/permissions";
import { toast } from "sonner";
export const ADMIN_NAV = [
  {
    label: "Tổng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    cap: "dashboard",
  },
  {
    label: "Lịch làm việc",
    href: "/admin/calendar",
    icon: CalendarDays,
    cap: "calendar",
  },
  {
    label: "Lịch hẹn",
    href: "/admin/appointments",
    icon: Rows3,
    cap: "appointments",
  },
  {
    label: "Khách hàng",
    href: "/admin/customers",
    icon: Users,
    cap: "customers",
  },
  {
    label: "Danh sách chờ",
    href: "/admin/waitlist",
    icon: Hourglass,
    cap: "waitlist",
  },
  { label: "Thông báo", href: "/admin/notices", icon: Send, cap: "notices" },
  { label: "Nhân viên", href: "/admin/staff", icon: UserRound, cap: "team" },
  { label: "Tài khoản", href: "/admin/users", icon: Users, cap: "team" },
  {
    label: "Dịch vụ",
    href: "/admin/services",
    icon: Scissors,
    cap: "catalogue",
  },
  {
    label: "Danh mục",
    href: "/admin/categories",
    icon: Tags,
    cap: "catalogue",
  },
  {
    label: "Kho sơn gel",
    href: "/admin/inventory",
    icon: Package,
    cap: "catalogue",
  },
  {
    label: "Khuyến mãi",
    href: "/admin/promotions",
    icon: BadgePercent,
    cap: "promotions",
  },
  { label: "Đánh giá", href: "/admin/reviews", icon: Star, cap: "reviews" },
  {
    label: "Thùng rác",
    href: "/admin/trash",
    icon: Trash2,
    cap: "catalogue",
  },
];
export function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, actions } = useAuth();
  function signOut() {
    onNavigate?.();
    actions.logout();
    router.replace("/admin/login");
  }
  const visible = ADMIN_NAV.filter((item) => can(session, item.cap));
  function resetDemo() {
    window.location.reload();
  }
  return (
    <nav aria-label="Quản trị" className="flex h-full flex-col bg-void">
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-3 border-b border-paper/10 px-6 py-6"
      >
        <span className="font-display text-2xl">VELA.</span>
        <span className="eyebrow text-champagne">Quản trị</span>
      </Link>
      <ul className="thin-scrollbar flex-1 overflow-y-auto px-3 py-4">
        {visible.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 border-l-2 px-3 py-3 text-sm transition-colors",
                pathname.startsWith(href)
                  ? "border-champagne bg-paper/[0.06] text-paper"
                  : "border-transparent text-paper/50 hover:bg-paper/[0.04] hover:text-paper",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-paper/10 p-5">
        <p className="truncate text-sm">
          {session?.user.name ?? "Quản trị VELA"}
        </p>
        <p className="mt-1 truncate text-xs text-paper/40">
          {session?.user.email ?? "Chưa đăng nhập"}
        </p>
        {session ? (
          <p className="mt-2 inline-block border border-paper/20 px-2 py-0.5 text-[0.625rem] uppercase tracking-[0.15em] text-champagne">
            {ROLE_LABEL[session.user.role]}
          </p>
        ) : null}
        <button
          type="button"
          onClick={resetDemo}
          className="mt-4 flex items-center gap-2 text-xs text-paper/50 transition-colors hover:text-paper"
        >
          <RotateCcw className="size-4" />
          Khôi phục dữ liệu mẫu
        </button>
        <button
          type="button"
          onClick={signOut}
          className="mt-3 flex items-center gap-2 text-xs text-paper/50 transition-colors hover:text-paper"
        >
          <LogOut className="size-4" />
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}
