"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { pad2 } from "@/lib/format";
export const BOOKING_STEPS = [
  "Dịch vụ",
  "Nhân viên",
  "Ngày & giờ",
  "Thông tin",
  "Xác nhận",
];
export function BookingStepper({ current, onJump, maxReached }) {
  const progress = ((current + 1) / BOOKING_STEPS.length) * 100;
  return (
    <>
      <ol className="hidden items-center gap-8 lg:flex">
        {BOOKING_STEPS.map((step, i) => {
          const state =
            i === current ? "current" : i < maxReached ? "done" : "todo";
          return (
            <li key={step}>
              <button
                type="button"
                disabled={i > maxReached}
                onClick={() => onJump(i)}
                className="group relative flex items-baseline gap-2.5 py-2 disabled:cursor-not-allowed"
                aria-current={i === current ? "step" : undefined}
              >
                <span
                  className={cn(
                    "eyebrow tabular transition-colors duration-200",
                    state === "current"
                      ? "text-champagne"
                      : state === "done"
                        ? "text-ink/45"
                        : "text-ink/20",
                  )}
                >
                  {pad2(i + 1)}
                </span>
                <span
                  className={cn(
                    "eyebrow transition-colors duration-200",
                    state === "current"
                      ? "text-ink"
                      : state === "done"
                        ? "text-ink/45 group-hover:text-ink"
                        : "text-ink/20",
                  )}
                >
                  {step}
                </span>
                {i === current ? (
                  <motion.span
                    layoutId="booking-step-rule"
                    className="absolute -bottom-0.5 left-0 h-px w-full bg-champagne"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex w-full items-center gap-4 lg:hidden">
        <span className="eyebrow tabular shrink-0 text-champagne">
          {pad2(current + 1)}
        </span>
        <span className="eyebrow shrink-0 text-ink">
          {BOOKING_STEPS[current]}
        </span>
        <span className="relative h-px flex-1 bg-ink/15">
          <motion.span
            className="absolute inset-y-0 left-0 bg-ink"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
        <span className="eyebrow tabular shrink-0 text-ink/30">
          {pad2(BOOKING_STEPS.length)}
        </span>
      </div>
    </>
  );
}
