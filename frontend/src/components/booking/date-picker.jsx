"use client";
import * as React from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TODAY,
  addDays,
  monthName,
  parseDate,
  weekdayKey,
} from "@/lib/clock";

const WINDOW = 7;

const DEFAULT_BUSINESS_HOURS = [
  { day: "mon", open: "07:00", close: "22:00" },
  { day: "tue", open: "07:00", close: "22:00" },
  { day: "wed", open: "07:00", close: "22:00" },
  { day: "thu", open: "07:00", close: "22:00" },
  { day: "fri", open: "07:00", close: "22:00" },
  { day: "sat", open: "07:00", close: "22:00" },
  { day: "sun", open: "07:00", close: "22:00" },
];

export function DatePicker({ value, onChange, weeksAhead = 8, businessHours = DEFAULT_BUSINESS_HOURS }) {
  const [offset, setOffset] = React.useState(0);
  const hoursList = Array.isArray(businessHours) && businessHours.length > 0 ? businessHours : DEFAULT_BUSINESS_HOURS;

  const days = React.useMemo(
    () =>
      Array.from({ length: WINDOW }, (_, i) => {
        const date = addDays(TODAY, offset * WINDOW + i);
        const hours = hoursList.find((h) => h.day === weekdayKey(date));
        return {
          date,
          closed: !hours?.open,
          label:
            weekdayKey(date) === "sun"
              ? "CN"
              : `T${parseDate(date).getDay() + 1}`,
          number: parseDate(date).getDate(),
        };
      }),
    [offset, hoursList],
  );

  const monthLabel = `${monthName(days[0].date)} ${parseDate(days[0].date).getFullYear()}`;
  const spansMonths =
    monthName(days[0].date) !== monthName(days[WINDOW - 1].date);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 border-b border-ink/12 pb-4">
        <p className="font-display text-[1.5rem] leading-none tracking-tight">
          {spansMonths
            ? `${monthName(days[0].date)} — ${monthName(days[WINDOW - 1].date)}`
            : monthLabel}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            aria-label="Tuần trước"
            className="flex size-9 items-center justify-center border border-ink/15 text-ink/50 transition-colors hover:border-ink hover:text-ink disabled:opacity-30 disabled:hover:border-ink/15 disabled:hover:text-ink/50"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.min(weeksAhead - 1, o + 1))}
            disabled={offset >= weeksAhead - 1}
            aria-label="Tuần sau"
            className="flex size-9 items-center justify-center border border-ink/15 text-ink/50 transition-colors hover:border-ink hover:text-ink disabled:opacity-30 disabled:hover:border-ink/15 disabled:hover:text-ink/50"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((item) => {
          const selected = value === item.date;
          return (
            <motion.button
              key={item.date}
              type="button"
              disabled={item.closed}
              onClick={() => onChange(item.date)}
              aria-pressed={selected}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center border p-2 transition-colors duration-200",
                item.closed
                  ? "cursor-not-allowed border-ink/8 text-ink/20 bg-ink/[0.02]"
                  : selected
                    ? "border-ink bg-ink text-ivory"
                    : "border-ink/15 text-ink hover:border-ink",
              )}
            >
              <span className="text-[0.75rem] uppercase opacity-60">
                {item.label}
              </span>
              <span className="font-display text-[1.375rem] font-normal leading-none sm:text-[1.625rem]">
                {item.number}
              </span>
              {item.closed && (
                <span className="mt-1 text-[0.625rem] text-ink/35">Đóng</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
