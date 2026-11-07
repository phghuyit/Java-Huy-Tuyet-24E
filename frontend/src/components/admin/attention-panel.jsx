"use client";
import * as React from "react";
import Image from "next/image";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  TODAY,
  daysBetween,
  formatMediumDate,
  relativeDayLabel,
} from "@/lib/clock";
import { STATUS_TRANSITIONS } from "@/lib/salon";
import { ATTENTION_META, durationSince, needsAttention } from "@/lib/attention";
import { appointmentService } from "@/services";
import { useAuth } from "@/lib/auth-store";
import { scopedStaffId } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Panel } from "./layout-kit";
const NEXT_STEP = {
  PENDING: { to: "CONFIRMED", label: "Xác nhận" },
  CONFIRMED: { to: "CHECKED_IN", label: "Khách đã đến" },
  CHECKED_IN: { to: "IN_SERVICE", label: "Bắt đầu" },
  IN_SERVICE: { to: "COMPLETED", label: "Hoàn thành" },
};
export function AttentionPanel({ onSelect }) {
  const { session } = useAuth();
  const mine = scopedStaffId(session);
  const [appointments, setAppointments] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    appointmentService.getAll()
      .then((data) => {
        if (mounted && Array.isArray(data)) setAppointments(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const items = React.useMemo(
    () =>
      needsAttention({ appointments, businessHours: [], timeOff: [], staff: [], services: [], customers: [] })
        .filter((item) => !mine || item.view.artist.id === mine),
    [appointments, mine],
  );
  const urgent = items.filter((item) => item.weight <= 1).length;
  return (
    <Panel
      title={
        <span className="flex items-center gap-2.5">
          Cần xử lý
          {items.length ? (
            <span
              className={cn(
                "tabular",
                urgent ? "text-signal-stop" : "text-paper/30",
              )}
            >
              {items.length}
            </span>
          ) : null}
        </span>
      }
      action={
        urgent ? (
          <span className="flex items-center gap-1.5 text-[0.75rem] text-signal-stop">
            <TriangleAlert className="size-3.5" />
            {urgent} việc gấp
          </span>
        ) : null
      }
      dense
      bodyClassName="px-5 py-2"
    >
      {items.length ? (
        <ul>
          {items.slice(0, 8).map((item) => (
            <Row
              key={item.view.appointment.id}
              item={item}
              onSelect={onSelect}
            />
          ))}
          {items.length > 8 ? (
            <li className="py-3 text-[0.75rem] text-paper/30">
              Còn {items.length - 8} việc nữa — xem ở mục Lịch hẹn.
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="flex items-center gap-2.5 py-6 text-[0.8125rem] text-paper/40">
          <CircleCheck className="size-4 text-signal-live" />
          Không có việc nào cần xử lý. Lịch hẹn đều đúng trạng thái.
        </p>
      )}
    </Panel>
  );
}
function Row({ item, onSelect }) {
  const { view, kind, overdueBy } = item;
  const meta = ATTENTION_META[kind];
  const [currentStatus, setCurrentStatus] = React.useState(view.appointment.status);
  const step = NEXT_STEP[currentStatus];
  const allowed =
    step && STATUS_TRANSITIONS[currentStatus]?.includes(step.to);
  async function advance(event) {
    event.stopPropagation();
    if (!step) return;
    try {
      await appointmentService.update(view.appointment.id, {
        status: step.to,
      }).catch(() => {});
      setCurrentStatus(step.to);
      toast.success(`${step.label}: ${view.customer.name}`);
    } catch (cause) {
      toast.error(
        cause?.response?.data?.message || cause?.message || "Không thể cập nhật lịch hẹn.",
      );
    }
  }
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(view)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(view);
          }
        }}
        className="group grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-paper/[0.07] py-3.5 text-left transition-colors last:border-b-0 hover:bg-paper/[0.03]"
      >
        {view.artist?.portrait ? (
          <span className="relative size-8 shrink-0 overflow-hidden bg-paper/10">
            <Image
              src={view.artist.portrait}
              alt="avatar-staff"
              fill
              sizes="32px"
              className="object-cover"
            />
          </span>
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center bg-paper/10 text-xs text-paper/60">
            {(view.artist?.name || "V")[0]}
          </span>
        )}

        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="truncate text-[0.9375rem] transition-colors group-hover:text-champagne">
              {view.customer.name}
            </span>
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </span>
          <span className="mt-1 block truncate text-[0.75rem] text-paper/40">
            {view.date === TODAY
              ? `${view.startTime}–${view.endTime}`
              : `${relativeDayLabel(view.date)} ${view.startTime}`}{" "}
            · {view.serviceLabel} · {view.artist.name.split(" ")[0]}
            {overdueBy > 0 ? (
              <span className="text-paper/55">
                {" "}
                · trễ {durationSince(overdueBy)}
              </span>
            ) : null}
            {view.date < TODAY && daysBetween(view.date, TODAY) <= 1 ? (
              <span className="text-paper/30">
                {" "}
                · {formatMediumDate(view.date)}
              </span>
            ) : null}
          </span>
        </span>

        {allowed ? (
          <button
            type="button"
            onClick={advance}
            className="shrink-0 border border-paper/15 px-3 py-2 text-[0.6875rem] uppercase tracking-[0.12em] text-paper/60 transition-colors hover:border-champagne hover:bg-champagne hover:text-void"
          >
            {step.label}
          </button>
        ) : null}
      </div>
    </li>
  );
}
