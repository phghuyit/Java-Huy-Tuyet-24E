"use client";
import * as React from "react";
import { CalendarSync, Check } from "lucide-react";
import { durationLabel, formatLongDate, TODAY } from "@/lib/clock";
import { appointmentService } from "@/services";
import { Button } from "@/components/ui/button";
import { DatePicker } from "./date-picker";
import { TimeSlotPicker } from "./time-slot-picker";
import { WaitlistInvite } from "./waitlist-invite";

const DEFAULT_SLOTS = [
  "07:00", "07:30", "08:00", "08:30",
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
];

export function ReschedulePanel({
  appointment,
  proof,
  artistName,
  tone = "light",
  onRescheduled,
}) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState(null);
  const [time, setTime] = React.useState(null);
  const [error, setError] = React.useState("");
  const [moved, setMoved] = React.useState("");
  const [busySlots, setBusySlots] = React.useState([]);

  React.useEffect(() => {
    if (!date) {
      setBusySlots([]);
      return;
    }
    let active = true;
    appointmentService
      .getBusySlots(date, appointment.staffId)
      .then((data) => {
        if (active && Array.isArray(data)) {
          setBusySlots(data);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [date, appointment.staffId]);

  const slots = date
    ? DEFAULT_SLOTS.map((t) => {
        const isCurrent =
          date === (appointment.appointmentDate || appointment.date) &&
          t === (appointment.startTime || appointment.timeStart);
        const toMin = (str) => {
          const [hh, mm] = String(str || "00:00").split(":").map(Number);
          return (hh || 0) * 60 + (mm || 0);
        };
        const slotStart = toMin(t);
        const duration = Number(appointment.durationMinutes || appointment.totalDuration || 45);
        const slotEnd = slotStart + duration;

        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        const isPast = date < TODAY || (date === TODAY && slotStart <= currentMin + 15);
        const isClosing = slotEnd > 22 * 60;

        const isBusy = busySlots.some((b) => {
          if (String(b.id) === String(appointment.id)) return false;
          const bStart = toMin(b.timeStart || b.startTime);
          const bEnd = toMin(b.timeEnd || b.endTime) || bStart + Number(b.totalDuration || 45);
          return slotStart < bEnd && slotEnd > bStart;
        });
        return {
          time: t,
          available: !isPast && !isCurrent && !isBusy && !isClosing,
          reason: isPast ? "past" : isCurrent ? "current" : isBusy ? "booked" : isClosing ? "closing" : null,
        };
      })
    : [];

  async function submit() {
    if (!date || !time) return;
    const toMin = (str) => {
      const [hh, mm] = String(str || "00:00").split(":").map(Number);
      return (hh || 0) * 60 + (mm || 0);
    };
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    if (date < TODAY || (date === TODAY && toMin(time) <= currentMin + 15)) {
      setError("Giờ hẹn phải sau thời điểm hiện tại ít nhất 15 phút.");
      return;
    }
    try {
      await appointmentService.rescheduleMy(appointment.id, {
        appointmentDate: date,
        startTime: time,
        timeStart: time,
      });
      setMoved(`${formatLongDate(date)} · ${time}`);
      setOpen(false);
      setError("");
      onRescheduled?.();
    } catch (cause) {
      setError(
        cause?.response?.data?.detail ||
          cause?.response?.data?.message ||
          cause?.message ||
          "Không đổi được lịch hẹn.",
      );
    }
  }
  if (moved) {
    return (
      <p className="mt-4 flex flex-wrap items-center gap-2 border-l border-champagne pl-4 text-[0.8125rem] leading-relaxed text-ink/60">
        <Check className="size-3.5 text-champagne" />
        Đã đổi sang {moved}. Lịch quay lại trạng thái{" "}
        <strong className="font-normal text-ink">Chờ xác nhận</strong> để salon
        xác nhận lại giờ mới.
      </p>
    );
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-[0.75rem] text-ink/40 transition-colors hover:text-champagne"
      >
        <CalendarSync className="size-3" />
        Đổi ngày giờ
      </button>
    );
  }
  return (
    <div className="mt-4 border border-ink/12 p-5">
      <p className="text-[0.875rem] leading-relaxed text-ink/60">
        Chọn giờ khác với{" "}
        <strong className="font-normal text-ink">{artistName}</strong> cho{" "}
        {durationLabel(appointment.durationMinutes || appointment.totalDuration || 45)}. Muốn đổi cả chuyên viên
        thì vui lòng gọi salon.
      </p>

      <div className="mt-5">
        <DatePicker
          value={date}
          onChange={(value) => {
            setDate(value);
            setTime(null);
            setError("");
          }}
        />
      </div>

      <div className="mt-6">
        {date ? (
          <>
            <TimeSlotPicker
              slots={slots}
              value={time}
              onChange={(value) => {
                setTime(value);
                setError("");
              }}
              emptyMessage={
                date <= TODAY
                  ? "Hôm nay salon đã hết khung giờ khả dụng. Quý khách vui lòng chọn ngày tiếp theo để dời lịch hẹn."
                  : undefined
              }
              columns="grid-cols-3 sm:grid-cols-5"
            />
            {!slots.some((slot) => slot.available) && date > TODAY ? (
              (() => {
                const resolvedServiceId =
                  appointment?.serviceIds?.[0] ||
                  appointment?.services?.[0]?.serviceId ||
                  appointment?.services?.[0]?.id ||
                  appointment?.serviceId ||
                  null;
                return resolvedServiceId ? (
                  <WaitlistInvite
                    serviceId={resolvedServiceId}
                    staffId={appointment.staffId}
                    date={date}
                    defaults={{
                      name: proof?.name,
                      phone: proof?.phone,
                      email: proof?.email,
                    }}
                  />
                ) : null;
              })()
            ) : null}
          </>
        ) : (
          <p className="border border-dashed border-ink/15 px-6 py-8 text-center text-[0.875rem] text-ink/45">
            Chọn ngày để xem các giờ còn trống.
          </p>
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 border-l border-signal-stop pl-3 text-[0.8125rem] text-signal-stop"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" disabled={!time} onClick={submit}>
          Đổi sang giờ này
        </Button>
        <Button
          size="sm"
          variant={tone === "dark" ? "ghostLight" : "ghost"}
          onClick={() => {
            setOpen(false);
            setDate(null);
            setTime(null);
            setError("");
          }}
        >
          Giữ giờ cũ
        </Button>
      </div>

      <p className="mt-4 text-[0.75rem] leading-relaxed text-ink/40">
        Sau khi đổi, lịch trở lại trạng thái Chờ xác nhận và salon sẽ xác nhận
        lại giờ mới.
      </p>
    </div>
  );
}
