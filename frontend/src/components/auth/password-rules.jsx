"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
export const PASSWORD_RULES = [
  { label: "Tối thiểu 8 ký tự", test: (value) => value.length >= 8 },
  { label: "Có chữ cái", test: (value) => /[a-zA-ZÀ-ỹ]/.test(value) },
  { label: "Có chữ số", test: (value) => /\d/.test(value) },
];
export const passwordMeetsRules = (value) =>
  PASSWORD_RULES.every((rule) => rule.test(value));
export function PasswordChecklist({ value, tone = "light", className }) {
  const dark = tone === "dark";
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2", className)}>
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-[0.75rem] transition-colors",
              passed
                ? dark
                  ? "text-signal-live"
                  : "text-ink"
                : dark
                  ? "text-paper/30"
                  : "text-ink/35",
            )}
          >
            <Check
              className={cn(
                "size-3 transition-colors",
                passed
                  ? dark
                    ? "text-signal-live"
                    : "text-champagne"
                  : dark
                    ? "text-paper/25"
                    : "text-ink/25",
              )}
            />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
