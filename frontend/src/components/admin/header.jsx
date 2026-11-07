"use client";
import Link from "next/link";
import { Search, PanelLeft, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";
import { formatLongDate, TODAY } from "@/lib/clock";
import { ADMIN_NAV } from "./sidebar";
export function AdminHeader({ onOpenSidebar, onOpenPalette }) {
  const pathname = usePathname();
  const current =
    ADMIN_NAV.find((item) => pathname.startsWith(item.href)) ?? ADMIN_NAV[0];
  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-paper/10 bg-char px-4 py-3 md:px-6">
      <button
        onClick={onOpenSidebar}
        aria-label="Mở navigation"
        className="p-2 lg:hidden"
      >
        <PanelLeft className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm">{current.label}</h1>
        <p className="mt-1 text-xs text-paper/40">{formatLongDate(TODAY)}</p>
      </div>
      <button
        onClick={onOpenPalette}
        aria-label="Tìm kiếm quản trị"
        className="flex items-center gap-2 border border-paper/15 px-3 py-2 text-xs text-paper/60"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Tìm kiếm</span>
        <kbd className="hidden sm:inline">Ctrl K</kbd>
      </button>
      <Link
        href="/"
        className="hidden items-center gap-2 text-xs text-paper/50 md:flex"
      >
        <ExternalLink className="size-4" />
        Xem website
      </Link>
    </header>
  );
}
