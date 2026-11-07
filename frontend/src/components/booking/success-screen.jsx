"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  CalendarPlus,
  House,
  MapPin,
  Sparkles,
} from "lucide-react";
import { STATUS_META } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { durationLabel, formatTime12 } from "@/lib/clock";
import { currency } from "@/lib/format";
const EASE = [0.22, 1, 0.36, 1];
export function SuccessScreen({ booking }) {
  const reduced = useReducedMotion();
  const icsHref = React.useMemo(() => buildIcs(booking), [booking]);
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-ivory">
      {!reduced ? <Celebration /> : null}

      <header className="gutter relative z-10 flex items-center justify-between py-6">
        <Link
          href="/"
          className="font-display text-[1.375rem] leading-none tracking-[-0.02em]"
        >
          VELA.
        </Link>
        <span className="eyebrow tabular text-ink/35">{booking.reference}</span>
      </header>

      <main className="gutter relative z-10 flex flex-1 items-center py-12">
        <div className="grid w-full grid-cols-1 items-center gap-x-16 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="eyebrow flex items-center gap-2.5 text-champagne"
            >
              <Sparkles className="size-3.5" />

              {STATUS_META[booking.status].label}
            </motion.p>

            <div className="mt-7 overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.95, ease: EASE, delay: 0.1 }}
                className="font-display text-d1 font-light leading-none"
              >
                ĐÃ GỬI LỊCH HẸN
              </motion.h1>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
              className="mt-12 border-t border-ink/12 pt-8"
            >
              <p className="font-display text-[2.5rem] leading-[1.05] tracking-tight md:text-[3.25rem]">
                {booking.dayName},
                <br />
                {booking.dayMonth}
                <br />
                <span className="tabular">{formatTime12(booking.time)}</span>
              </p>

              <p className="mt-8 text-[1.0625rem] text-ink/60">
                {booking.serviceLabel} cùng{" "}
                <span className="text-ink">{booking.artistName}</span>
              </p>
              <p className="mt-2 text-[0.875rem] tabular text-ink/40">
                {durationLabel(booking.durationMin)} · {currency(booking.total)}{" "}
                · kết thúc lúc {formatTime12(booking.endTime)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.62 }}
              className="mt-12 flex flex-wrap gap-3"
            >
              <Action
                href={icsHref}
                download={`vela-${booking.isoDate}.ics`}
                icon={CalendarPlus}
                primary
              >
                Lưu lịch cá nhân
              </Action>
              <Action
                href={`/booking/lookup?code=${booking.reference}`}
                icon={ArrowUpRight}
              >
                Tra cứu lịch hẹn
              </Action>
              <Action href={booking.mapsUrl} icon={MapPin} external>
                Xem đường đi
              </Action>
              <Action href="/" icon={House}>
                Về trang chủ
              </Action>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            className="lg:col-span-5"
          >
            <div
              id="booking-details"
              className="scroll-mt-6 border border-ink/12 bg-paper"
            >
              {booking.artistPortrait ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={booking.artistPortrait}
                    alt={booking.artistName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent" />
                  <p className="absolute bottom-5 left-5 font-display text-[1.75rem] leading-none text-paper">
                    {booking.artistName}
                  </p>
                </div>
              ) : null}

              <dl className="divide-y divide-ink/10 px-7 py-2">
                <Row label="Khách hàng" value={booking.clientName} />
                <Row label="Mã đặt lịch" value={booking.reference} />
                <Row
                  label="Nên có mặt lúc"
                  value={`${formatTime12(subtract(booking.time, 10))}`}
                />
                <Row label="Salon" value={booking.address} />
              </dl>

              <p className="border-t border-ink/10 px-7 py-5 text-[0.75rem] leading-relaxed text-ink/40">
                Yêu cầu đang chờ salon xác nhận. Nếu cần thay đổi hoặc hủy lịch
                hẹn, quý khách vui lòng liên hệ trực tiếp với salon qua thông
                tin liên hệ trên website.
              </p>
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4">
      <dt className="eyebrow shrink-0 text-ink/35">{label}</dt>
      <dd className="text-right text-[0.9375rem] text-ink/80">{value}</dd>
    </div>
  );
}
function Action({ href, children, icon: Icon, primary, external, download }) {
  const className = cn(
    "eyebrow inline-flex items-center gap-2.5 border px-5 py-4 transition-colors duration-200",
    primary
      ? "border-ink bg-ink text-ivory hover:bg-champagne hover:border-champagne hover:text-void"
      : "border-ink/20 text-ink/70 hover:border-ink hover:text-ink",
  );
  if (external || download) {
    return (
      <a
        href={href}
        download={download}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className={className}
      >
        <Icon className="size-3.5" />
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      <Icon className="size-3.5" />
      {children}
    </Link>
  );
}
function Celebration() {
  const motes = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 4 + ((i * 7.3) % 92),
        delay: 0.2 + (i % 7) * 0.16,
        size: i % 3 === 0 ? 3 : 2,
        drift: i % 2 === 0 ? 18 : -14,
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {motes.map((mote) => (
        <motion.span
          key={mote.id}
          className="absolute bottom-0 rounded-full bg-champagne"
          style={{
            left: `${mote.left}%`,
            width: mote.size,
            height: mote.size,
          }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: -560, opacity: [0, 0.75, 0], x: mote.drift }}
          transition={{
            duration: 4.2,
            delay: mote.delay,
            ease: [0.2, 0.6, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}
function subtract(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = Math.max(0, h * 60 + m - minutes);
  return `${`${Math.floor(total / 60)}`.padStart(2, "0")}:${`${total % 60}`.padStart(2, "0")}`;
}
function buildIcs(booking) {
  const stamp = (date, time) =>
    `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VELA Salon//Booking//VI",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@vela.beauty`,
    `DTSTART:${stamp(booking.isoDate, booking.time)}`,
    `DTEND:${stamp(booking.isoDate, booking.endTime)}`,
    `SUMMARY:${booking.serviceLabel} cùng ${booking.artistName} — VELA`,
    `LOCATION:${booking.address}`,
    `DESCRIPTION:Mã đặt lịch ${booking.reference}. Vui lòng đến sớm 10 phút.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`;
}
