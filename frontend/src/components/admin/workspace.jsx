"use client";
import * as React from "react";
import { toast } from "sonner";
import { formatMediumDate } from "@/lib/clock";
import { currency } from "@/lib/format";
import { netPrice } from "@/lib/promotions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { StatusPill } from "@/components/ui/badge";

export const linkClass = "text-sm text-champagne underline underline-offset-4";
export const emptyClass =
  "border-y border-paper/10 py-12 text-center text-sm text-paper/50";

export function Empty({ children = "Không có dữ liệu phù hợp." }) {
  return (
    <p role="status" className={emptyClass}>
      {children}
    </p>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-champagne"
      />
      {label}
    </label>
  );
}

export function Search({ value, onChange, placeholder = "Tìm kiếm…" }) {
  return (
    <div className="min-w-48 flex-1">
      <Input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export async function saveAction(action, onClose, onError) {
  try {
    await action();
    toast.success("Đã lưu thay đổi");
    onClose();
  } catch (error) {
    onError(error instanceof Error ? error.message : "Không thể lưu thay đổi.");
  }
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemLabel = "mục",
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalItems === 0) return null;

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, totalItems);

  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let p = startPage; p <= endPage; p++) {
    pages.push(p);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 pt-4 text-xs text-paper/60">
      <div className="flex items-center gap-3">
        <span>
          Hiển thị <strong className="text-paper">{startIdx}</strong>–<strong className="text-paper">{endIdx}</strong> trên <strong className="text-champagne">{totalItems}</strong> {itemLabel}
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded border border-paper/15 bg-night-surface px-2 py-1 text-xs text-paper focus:border-champagne focus:outline-none"
          >
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outlineLight"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-7 px-2.5 text-xs disabled:opacity-30"
        >
          Trước
        </Button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="h-7 min-w-[28px] rounded border border-transparent px-1.5 text-xs hover:border-paper/20 hover:text-paper"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 text-paper/40">…</span>}
          </>
        )}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-7 min-w-[28px] rounded border px-1.5 text-xs font-medium transition-colors ${
              p === page
                ? "border-champagne bg-champagne/15 text-champagne"
                : "border-transparent text-paper/70 hover:border-paper/20 hover:text-paper"
            }`}
          >
            {p}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-1 text-paper/40">…</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="h-7 min-w-[28px] rounded border border-transparent px-1.5 text-xs hover:border-paper/20 hover:text-paper"
            >
              {totalPages}
            </button>
          </>
        )}
        <Button
          variant="outlineLight"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-7 px-2.5 text-xs disabled:opacity-30"
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

export function isAppointmentPaid(appt) {
  if (!appt) return false;
  if (appt.payment && Number(appt.payment.amount) > 0) return true;
  const ps = (appt.paymentStatus || "").toUpperCase();
  if (ps === "PAID") return true;
  if (
    appt.amountPaid &&
    Number(appt.amountPaid) >= Number(appt.price || appt.totalAmount || 0)
  ) {
    return true;
  }
  return false;
}

export function AppointmentRows({ rows, onSelect }) {
  if (!rows.length)
    return (
      <Empty>
        Không có lịch hẹn phù hợp. Bạn có thể chọn ngày khác hoặc tạo lịch mới.
      </Empty>
    );
  return (
    <div className="divide-y divide-paper/10 border-y border-paper/10">
      {rows.map((view) => {
        const unpaidCompleted =
          view.appointment.status === "COMPLETED" &&
          !isAppointmentPaid(view.appointment);
        return (
          <button
            type="button"
            key={view.appointment.id}
            onClick={() => onSelect(view)}
            className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-2 py-5 text-left transition-colors hover:bg-paper/[0.04] sm:grid-cols-[7.5rem_1fr_auto]"
          >
            <span className="text-sm tabular text-champagne">
              {view.startTime}–{view.endTime}
              <span className="mt-1 block text-xs text-paper/40">
                {formatMediumDate(view.date)}
              </span>
            </span>
            <span className="col-start-1 sm:col-start-auto">
              <span className="block text-sm font-medium text-paper">{view.customer.name}</span>
              <span className="mt-1 block text-xs text-paper/50">
                {view.serviceLabel} · {view.artist.name}
              </span>
              <span className="mt-1 block text-xs tabular text-paper/35">
                {view.appointment.bookingCode} ·{" "}
                {currency(netPrice(view.appointment))}
                {view.appointment.discount > 0 && view.appointment.promotionCode
                  ? ` · mã ${view.appointment.promotionCode}`
                  : ""}
              </span>
            </span>
            <span className="col-start-2 row-start-1 row-end-3 sm:col-start-auto sm:row-auto flex flex-col items-end gap-1.5">
              <StatusPill status={view.appointment.status} />
              {unpaidCompleted && (
                <span className="inline-flex items-center rounded border border-amber-500/50 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400 animate-pulse">
                  Chưa thu tiền
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { DashboardOverview } from "./dashboard-overview";
export { AppointmentsWorkspace } from "./appointments-workspace";
export { CustomersWorkspace, CustomerDetail } from "./customers-workspace";
export { StaffWorkspace } from "./staff-workspace";
export { ServicesWorkspace } from "./services-workspace";
export { CategoriesWorkspace } from "./categories-workspace";
export { UsersWorkspace } from "./users-workspace";
