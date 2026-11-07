"use client";
import { cn } from "@/lib/utils";
export function AdminSelect({ className, ...props }) {
  return (
    <select
      className={cn(
        "min-h-10 w-full border-b border-paper/20 bg-char px-1 py-2 text-[0.875rem] text-paper outline-none focus:border-champagne disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
export function FormError({ message }) {
  return message ? (
    <p
      role="alert"
      className="border-l border-signal-stop pl-3 text-[0.8125rem] leading-relaxed text-signal-stop"
    >
      {message}
    </p>
  ) : null;
}
