"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { durationLabel, formatLongDate, formatTime12 } from "@/lib/clock";
import { currency } from "@/lib/format";
export function BookingSummary({ model, className, tone = "light" }) {
  const dark = tone === "dark";
  const { services, artist, anyArtist, date, time } = model;
  const rows = [];
  if (artist) rows.push({ label: "Nhân viên", value: artist.name });
  else if (anyArtist)
    rows.push({ label: "Nhân viên", value: "Nhân viên phù hợp còn trống" });
  if (date) rows.push({ label: "Ngày", value: formatLongDate(date) });
  if (time) {
    if (model.totalDuration) {
      const parts = String(time).split(":");
      const startMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      const endMin = startMin + model.totalDuration;
      const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
      const endM = String(endMin % 60).padStart(2, "0");
      rows.push({
        label: "Giờ hẹn (24h)",
        value: `${time.slice(0, 5)} — ${endH}:${endM}`,
      });
    } else {
      rows.push({ label: "Giờ hẹn (24h)", value: time.slice(0, 5) });
    }
  }
  if (model.totalDuration)
    rows.push({
      label: "Thời lượng",
      value: durationLabel(model.totalDuration),
    });
  return (
    <div
      className={cn(
        "border p-7 md:p-8",
        dark ? "border-paper/12" : "border-ink/12",
        className,
      )}
    >
      <p className={cn("eyebrow", dark ? "text-champagne" : "text-champagne")}>
        Lịch hẹn của bạn
      </p>

      {services.length ? (
        <ul className="mt-6 space-y-4">
          <AnimatePresence initial={false}>
            {services.map((service) => (
              <motion.li
                key={service.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4"
              >
                <span className="relative size-12 shrink-0 overflow-hidden bg-nude/30">
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block font-display text-[1.375rem] leading-tight tracking-tight",
                      dark ? "text-paper" : "text-ink",
                    )}
                  >
                    {service.name}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-[0.75rem] tabular",
                      dark ? "text-paper/40" : "text-ink/40",
                    )}
                  >
                    {durationLabel(service.durationMin, service.durationMax)}
                  </span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[0.9375rem] tabular",
                    dark ? "text-paper/80" : "text-ink",
                  )}
                >
                  {currency(service.price)}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p
          className={cn(
            "mt-6 text-[0.875rem]",
            dark ? "text-paper/35" : "text-ink/35",
          )}
        >
          Bạn chưa chọn dịch vụ.
        </p>
      )}

      {rows.length ? (
        <dl
          className={cn(
            "mt-7 space-y-3 border-t pt-6",
            dark ? "border-paper/12" : "border-ink/12",
          )}
        >
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4"
            >
              <dt
                className={cn(
                  "eyebrow",
                  dark ? "text-paper/35" : "text-ink/35",
                )}
              >
                {row.label}
              </dt>
              <dd
                className={cn(
                  "text-right text-[0.9375rem]",
                  dark ? "text-paper/85" : "text-ink/85",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {model.discount ? (
        <div
          className={cn(
            "mt-6 flex items-baseline justify-between border-t pt-5 text-[0.875rem]",
            dark ? "border-paper/12" : "border-ink/12",
          )}
        >
          <span className={dark ? "text-paper/50" : "text-ink/50"}>
            Mã {model.promotionCode}
          </span>
          <span className="tabular text-champagne">
            − {currency(model.discount)}
          </span>
        </div>
      ) : null}

      <div
        className={cn(
          "mt-7 flex items-baseline justify-between border-t pt-6",
          dark ? "border-paper/12" : "border-ink/12",
        )}
      >
        <span className={cn("eyebrow", dark ? "text-paper/35" : "text-ink/35")}>
          Tổng giá
        </span>
        <span
          className={cn(
            "font-display text-[2rem] leading-none tracking-tight tabular",
            dark ? "text-paper" : "text-ink",
          )}
        >
          {model.fromPrice ? "Từ " : ""}
          {currency(Math.max(model.totalPrice - (model.discount ?? 0), 0))}
        </span>
      </div>

      <p
        className={cn(
          "mt-4 text-[0.75rem] leading-relaxed",
          dark ? "text-paper/30" : "text-ink/35",
        )}
      >
        Giá và thời lượng dịch vụ được xác nhận khi đặt lịch. Quý khách thanh
        toán tại salon sau khi hoàn tất dịch vụ.
      </p>
    </div>
  );
}
