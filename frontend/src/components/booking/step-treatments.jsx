"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { durationLabel } from "@/lib/clock";
import { priceLabel } from "@/lib/format";
export function StepTreatments({ services, selected, onToggle }) {
  return (
    <ul className="border-t border-ink/12">
      {services.map((service, i) => {
        const isOn = selected.includes(service.id);
        return (
          <motion.li
            key={service.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.04,
              duration: 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              type="button"
              onClick={() => onToggle(service.id)}
              aria-pressed={isOn}
              className={cn(
                "group flex w-full flex-wrap items-center gap-3 border-b border-ink/12 py-5 text-left transition-colors duration-200 sm:gap-5",
                isOn && "bg-ink/[0.035]",
              )}
            >
              <span
                className={cn(
                  "relative hidden size-16 shrink-0 overflow-hidden bg-nude/30 sm:block",
                )}
              >
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-[1.5rem] leading-none tracking-tight md:text-[1.75rem]">
                    {service.name}
                  </span>
                  {service.signature ? (
                    <span className="eyebrow text-champagne">Đặc trưng</span>
                  ) : null}
                </span>
                <span className="mt-2 block max-w-[54ch] text-[0.8125rem] leading-relaxed text-ink/45">
                  {service.summary}
                </span>
              </span>

              <span className="hidden shrink-0 text-right text-[0.8125rem] text-ink/45 sm:block">
                {durationLabel(service.durationMin, service.durationMax)}
              </span>

              <span className="shrink-0 text-right text-[0.8125rem] tabular text-ink sm:text-[0.9375rem]">
                {priceLabel(service.price, service.priceFrom)}
              </span>

              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center border transition-colors duration-200",
                  isOn
                    ? "border-champagne bg-champagne text-void"
                    : "border-ink/20 text-ink/30 group-hover:border-ink",
                )}
              >
                {isOn ? (
                  <Check className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
              </span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
