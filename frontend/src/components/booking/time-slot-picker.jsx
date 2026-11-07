"use client";
import { cn } from "@/lib/utils";
import { formatTime12 } from "@/lib/clock";
const REASON_LABEL = {
  booked: "Không còn trống (Đã có lịch hẹn)",
  off: "Không khả dụng",
  closed: "Đóng cửa",
  closing: "Không đủ thời gian trước giờ đóng cửa (20:00)",
  past: "Đã qua",
  current: "Giờ hẹn hiện tại của bạn",
};
export function TimeSlotPicker({
  slots,
  value,
  onChange,
  duration,
  emptyMessage,
  columns = "grid-cols-3 sm:grid-cols-4",
}) {
  if (!slots.some((slot) => slot.available)) {
    return (
      <p className="border border-dashed border-ink/15 px-6 py-10 text-center text-[0.875rem] text-ink/45">
        {emptyMessage ||
          "Không còn giờ trống phù hợp trong ngày này. Vui lòng chọn ngày hoặc nhân viên khác."}
      </p>
    );
  }
  const free = slots.filter((slot) => slot.available).length;
  const hasClosingSlots = slots.some((slot) => slot.reason === "closing");

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="eyebrow text-ink/40">{free} giờ còn trống</p>
        {duration ? (
          <span className="text-xs text-ink/50">Thời lượng dự kiến: {duration} phút</span>
        ) : null}
      </div>

      <div className={cn("grid gap-2", columns)}>
        {slots.map((slot) => {
          const selected = value === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              onClick={() => onChange(slot.time)}
              aria-pressed={selected}
              title={slot.reason ? REASON_LABEL[slot.reason] : undefined}
              className={cn(
                "relative overflow-hidden border py-3.5 text-[0.875rem] tabular transition-colors duration-200",
                !slot.available
                  ? "cursor-not-allowed border-ink/8 text-ink/20"
                  : selected
                    ? "border-ink bg-ink text-ivory"
                    : "border-ink/15 text-ink/80 hover:border-ink hover:text-ink",
              )}
            >
              {formatTime12(slot.time)}
              {!slot.available ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_5px,rgba(24,23,21,0.05)_5px,rgba(24,23,21,0.05)_6px)]"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {hasClosingSlots ? (
        <p className="mt-4 text-xs text-ink/45 leading-relaxed">
          * Các khung giờ cuối ngày bị khóa do tổng thời gian thực hiện dịch vụ ({duration || 45} phút) sẽ kết thúc sau giờ đóng cửa của salon (20:00).
        </p>
      ) : null}
    </div>
  );
}
