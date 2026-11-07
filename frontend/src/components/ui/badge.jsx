import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em]", {
    variants: {
        tone: {
            neutral: "border-ink/15 text-ink/60 [[data-tone=dark]_&]:border-paper/15 [[data-tone=dark]_&]:text-paper/60",
            ink: "border-ink bg-ink text-ivory",
            champagne: "border-champagne/50 bg-champagne/12 text-champagne",
            live: "border-signal-live/40 bg-signal-live/10 text-signal-live",
            warn: "border-signal-warn/40 bg-signal-warn/10 text-signal-warn",
            stop: "border-signal-stop/40 bg-signal-stop/10 text-signal-stop",
            info: "border-signal-info/40 bg-signal-info/10 text-signal-info",
            muted: "border-ink/15 text-ink/45 [[data-tone=dark]_&]:border-paper/15 [[data-tone=dark]_&]:text-paper/45",
        },
    },
    defaultVariants: { tone: "neutral" },
});
export function Badge({ className, tone, ...props }) {
    return <span className={cn(badgeVariants({ tone }), className)} {...props}/>;
}
export const STATUS_META = {
    PENDING: { label: "Chờ xác nhận", tone: "champagne", dot: "bg-champagne" },
    CONFIRMED: { label: "Đã xác nhận", tone: "info", dot: "bg-signal-info" },
    CHECKED_IN: { label: "Đã đến", tone: "warn", dot: "bg-signal-warn" },
    IN_SERVICE: { label: "Đang phục vụ", tone: "live", dot: "bg-signal-live" },
    COMPLETED: {
        label: "Hoàn thành",
        tone: "muted",
        dot: "bg-ink/30 [[data-tone=dark]_&]:bg-paper/30",
    },
    CANCELLED: { label: "Đã hủy", tone: "stop", dot: "bg-signal-stop" },
    NO_SHOW: { label: "Không đến", tone: "stop", dot: "bg-signal-stop" },
};
export function StatusPill({ status, className, pulse, }) {
    const meta = STATUS_META[status];
    return (<Badge tone={meta.tone} className={className}>
      <span className={cn("size-1.5 shrink-0", meta.dot)}>
        {pulse && status === "IN_SERVICE" ? (<span className={cn("block size-full animate-ping", meta.dot)} aria-hidden/>) : null}
      </span>
      {meta.label}
    </Badge>);
}
