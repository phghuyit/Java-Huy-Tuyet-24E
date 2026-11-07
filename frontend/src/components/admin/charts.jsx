"use client";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
const EASE = [0.22, 1, 0.36, 1];
export function DayBars({
  data,
  height = 200,
  axisLabel,
  averageLabel,
  className,
}) {
  const reduced = useReducedMotion();
  const [hover, setHover] = React.useState(null);
  const max = Math.max(1, ...data.map((item) => item.value));
  const active = data.filter((item) => item.value > 0);
  const average = active.length
    ? active.reduce((sum, item) => sum + item.value, 0) / active.length
    : 0;
  const step =
    data.length > 40 ? 7 : data.length > 24 ? 3 : data.length > 14 ? 2 : 1;
  const ticks = [max, max / 2, 0];
  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-3">
        <div
          className="flex w-14 shrink-0 flex-col justify-between text-right text-[0.625rem] tabular text-paper/30"
          style={{ height }}
          aria-hidden
        >
          {ticks.map((tick) => (
            <span key={tick} className="leading-none">
              {axisLabel(tick)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1" style={{ height }}>
          {ticks.map((tick, i) => (
            <span
              key={tick}
              className="absolute inset-x-0 h-px bg-paper/[0.07]"
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
              aria-hidden
            />
          ))}

          {average > 0 ? (
            <span
              className="absolute inset-x-0 z-10 border-t border-dashed border-champagne/45"
              style={{ bottom: `${(average / max) * 100}%` }}
              aria-hidden
            >
              <span className="absolute -top-4 right-0 bg-char px-1.5 text-[0.625rem] tabular text-champagne/70">
                TB {averageLabel ? averageLabel(average) : axisLabel(average)}
              </span>
            </span>
          ) : null}

          <div className="flex h-full items-end gap-px">
            {data.map((item, i) => (
              <button
                key={item.label + i}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onBlur={() => setHover(null)}
                aria-label={`${item.label}: ${item.display}`}
                className="group flex h-full flex-1 flex-col justify-end"
              >
                <motion.span
                  className={cn(
                    "block w-full transition-colors",
                    hover === i
                      ? "bg-champagne"
                      : "bg-paper/25 group-hover:bg-champagne",
                  )}
                  style={{
                    height: `${Math.max(item.value ? 2 : 0, (item.value / max) * height)}px`,
                    transformOrigin: "bottom",
                  }}
                  initial={reduced ? undefined : { scaleY: 0 }}
                  animate={reduced ? undefined : { scaleY: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: Math.min(i * 0.006, 0.4),
                    ease: EASE,
                  }}
                />
              </button>
            ))}
          </div>

          {hover !== null ? (
            <div
              className="pointer-events-none absolute -top-2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap border border-paper/15 bg-char px-3 py-2"
              style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
            >
              <p className="text-[0.8125rem] tabular text-paper">
                {data[hover].display}
              </p>
              {data[hover].caption ? (
                <p className="mt-1 text-[0.6875rem] text-paper/40">
                  {data[hover].caption}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <span className="w-14 shrink-0" />
        <div className="flex min-w-0 flex-1 gap-px border-t border-paper/10 pt-2">
          {data.map((item, i) => (
            <span
              key={item.label + i}
              className="relative flex-1 text-[0.625rem] tabular text-paper/30"
            >
              {i % step === 0 ? (
                <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {item.label}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export function RankedBars({ rows, className }) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...rows.map((row) => row.share));
  return (
    <ul className={cn("space-y-4", className)}>
      {rows.map((row, i) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 truncate text-[0.8125rem] text-paper/75">
              {row.label}
            </span>
            <span className="shrink-0 text-[0.75rem] tabular text-paper/50">
              {row.value}
              {row.caption ? (
                <span className="ml-2 text-paper/25">{row.caption}</span>
              ) : null}
            </span>
          </div>
          <div className="mt-2 h-0.5 w-full bg-paper/10">
            <motion.div
              className="h-0.5 bg-champagne"
              style={{
                width: `${(row.share / max) * 100}%`,
                transformOrigin: "left",
              }}
              initial={reduced ? undefined : { scaleX: 0 }}
              animate={reduced ? undefined : { scaleX: 1 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
export function Heatmap({ rows, rowLabels, colLabels, max, className }) {
  return (
    <div className={cn("thin-scrollbar overflow-x-auto", className)}>
      <table className="w-full min-w-[30rem] border-separate border-spacing-[2px]">
        <caption className="sr-only">Mật độ lịch hẹn theo thứ và giờ</caption>
        <thead>
          <tr>
            <th className="w-10" />
            {colLabels.map((label) => (
              <th
                key={label}
                scope="col"
                className="pb-2 text-center text-[0.625rem] font-normal tabular text-paper/25"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={rowLabels[r]}>
              <th
                scope="row"
                className={cn(
                  "pr-3 text-right text-[0.6875rem] font-normal",
                  row.some((value) => value > 0)
                    ? "text-paper/35"
                    : "text-paper/15",
                )}
              >
                {rowLabels[r]}
              </th>
              {row.map((value, c) => {
                const intensity = (value / max) * 100;
                return (
                  <td key={c}>
                    <span
                      title={`${rowLabels[r]} ${colLabels[c]}:00 — ${value} lịch hẹn`}
                      className="flex h-8 w-full items-center justify-center text-[0.6875rem] tabular transition-transform duration-150 hover:scale-105"
                      style={{
                        backgroundColor: `color-mix(in oklab, var(--color-champagne) ${Math.round(intensity)}%, transparent)`,
                        color:
                          intensity > 55
                            ? "var(--color-void)"
                            : "color-mix(in oklab, var(--color-paper) 45%, transparent)",
                        outline:
                          intensity > 85
                            ? "1px solid var(--color-champagne)"
                            : undefined,
                      }}
                    >
                      {value || ""}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex items-center gap-2.5">
        <span className="text-[0.625rem] text-paper/30">Ít</span>
        {[15, 35, 55, 75, 100].map((level) => (
          <span
            key={level}
            className="h-3 w-7"
            style={{
              backgroundColor: `color-mix(in oklab, var(--color-champagne) ${level}%, transparent)`,
            }}
          />
        ))}
        <span className="text-[0.625rem] text-paper/30">
          Nhiều · tối đa {max} lịch/giờ
        </span>
      </div>
    </div>
  );
}
export function SplitBar({ segments, className }) {
  const total = Math.max(
    1,
    segments.reduce((sum, item) => sum + item.value, 0),
  );
  return (
    <div className={className}>
      <div className="flex h-2 w-full gap-px overflow-hidden">
        {segments.map((segment) => (
          <span
            key={segment.label}
            className={segment.muted ? "bg-paper/20" : "bg-champagne"}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {segments.map((segment) => (
          <li
            key={segment.label}
            className="flex items-baseline justify-between gap-4 text-[0.8125rem]"
          >
            <span className="flex items-center gap-2.5 text-paper/60">
              <span
                className={cn(
                  "size-2 shrink-0",
                  segment.muted ? "bg-paper/20" : "bg-champagne",
                )}
              />
              {segment.label}
            </span>
            <span className="tabular text-paper/80">
              {segment.value}
              <span className="ml-2 text-paper/30">
                {Math.round((segment.value / total) * 100)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
