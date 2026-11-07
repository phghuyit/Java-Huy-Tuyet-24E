"use client";
import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Plus, X } from "lucide-react";
import { Toaster } from "sonner";
import { AdminHeader } from "./header";
import { AdminSidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";
import { BookingDrawer } from "./booking-drawer";
import { useAuth } from "@/lib/auth-store";
import { can, routeCapability } from "@/lib/permissions";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
const PUBLIC_ROUTES = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];
export function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [navigation, setNavigation] = React.useState(false);
  const [palette, setPalette] = React.useState(false);
  const [booking, setBooking] = React.useState(null);
  React.useEffect(() => {
    const listener = (event) => setBooking(event.detail ?? {});
    window.addEventListener("vela:new-booking", listener);
    return () => window.removeEventListener("vela:new-booking", listener);
  }, []);
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const needed = routeCapability(pathname);
  const allowed = !needed || can(auth.session, needed);
  const locked = auth.ready && !auth.isAuthenticated && !isPublic;
  React.useEffect(() => {
    if (locked)
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
  }, [locked, pathname, router]);
  if (isPublic)
    return (
      <div data-tone="dark" className="min-h-dvh bg-void text-paper">
        {children}
      </div>
    );
  if (!auth.ready || locked)
    return (
      <div
        data-tone="dark"
        className="flex min-h-dvh items-center justify-center bg-void text-paper"
      >
        <Loader2 className="size-5 animate-spin text-paper/30" />
        <span className="sr-only">Đang kiểm tra phiên đăng nhập…</span>
      </div>
    );
  return (
    <div
      data-tone="dark"
      className="flex h-dvh overflow-hidden bg-void text-paper"
    >
      <aside className="hidden w-60 shrink-0 border-r border-paper/10 print:hidden lg:block">
        <AdminSidebar />
      </aside>
      <Dialog.Root open={navigation} onOpenChange={setNavigation}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-void/75" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 max-w-[90vw] bg-void">
            <Dialog.Title className="sr-only">Navigation quản trị</Dialog.Title>
            <Dialog.Description className="sr-only">
              Các module quản lý salon
            </Dialog.Description>
            <AdminSidebar onNavigate={() => setNavigation(false)} />
            <Dialog.Close
              aria-label="Đóng navigation"
              className="absolute right-3 top-5 p-2"
            >
              <X className="size-4" />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <AdminHeader
            onOpenSidebar={() => setNavigation(true)}
            onOpenPalette={() => setPalette(true)}
          />
        </div>
        <main className="thin-scrollbar flex-1 overflow-y-auto pb-24">
          {allowed ? (
            children
          ) : (
            <Denied />
          )}
        </main>
      </div>
      <button
        onClick={() => setBooking({})}
        aria-label="Tạo lịch hẹn"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 bg-champagne px-4 py-3 text-sm text-void transition-colors hover:bg-paper print:hidden"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">Tạo lịch hẹn</span>
      </button>
      <CommandPalette
        open={palette}
        onOpenChange={setPalette}
        onNewBooking={() => setBooking({})}
      />
      {booking && (
        <BookingDrawer
          open
          onClose={() => setBooking(null)}
          customerId={booking.customerId}
        />
      )}
      <div className="print:hidden">
        <Toaster position="bottom-center" theme="dark" closeButton />
      </div>
    </div>
  );
}
function Denied() {
  return (
    <div className="gutter flex min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="size-7 text-signal-stop" />
      <h1 className="mt-6 font-display text-3xl">
        Bạn không có quyền vào mục này
      </h1>
      <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-paper/55">
        Tài khoản chuyên viên chỉ xem được lịch hẹn, hồ sơ và đánh giá của chính
        mình. Cần xem doanh thu, bảng giá hay báo cáo thì đăng nhập bằng tài
        khoản chủ salon.
      </p>
      <Link
        href="/admin/dashboard"
        className="mt-8 text-sm text-champagne underline underline-offset-4"
      >
        Về tổng quan
      </Link>
    </div>
  );
}
