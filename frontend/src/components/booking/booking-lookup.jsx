"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Search, X } from "lucide-react";
import { durationLabel, formatLongDate } from "@/lib/clock";
import { currency } from "@/lib/format";
import { ReschedulePanel } from "./reschedule-panel";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal } from "@/components/motion/reveal";
import { StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { appointmentService, staffService } from "@/services";

const CANCELLABLE = ["PENDING", "CONFIRMED"];

export function BookingLookup({ initialCode = "" }) {
  const [code, setCode] = React.useState(initialCode);
  const [phone, setPhone] = React.useState("");
  const [found, setFound] = React.useState(null);
  const [error, setError] = React.useState("");
  const [searching, setSearching] = React.useState(false);

  const view = found;

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSearching(true);
    const trimmedCode = code.trim().toUpperCase();
    const trimmedPhone = phone.trim();

    if (!trimmedCode) {
      setError("Vui lòng nhập mã đặt lịch");
      setSearching(false);
      return;
    }

    try {
      const match = await appointmentService.lookup(trimmedCode, trimmedPhone);
      if (!match) {
        setFound(null);
        setError(
          "Không tìm thấy lịch hẹn khớp với mã và số điện thoại bạn nhập. Vui lòng kiểm tra lại.",
        );
        return;
      }

      let stf = { name: "Chuyên viên VELA" };
      if (match.staffId) {
        try {
          stf = await staffService.getById(match.staffId);
        } catch {}
      }

      const servicesList = (match.services || []).map((item) => ({
        id: String(item.serviceId || item.id),
        name: item.serviceName || "Dịch vụ",
        price: Number(item.price || 0),
        durationMin: 45,
      }));

      const discount = Number(match.discountAmount || 0);
      const subTotal = Number(match.subTotal || 0);
      const totalAmount = match.totalAmount != null
        ? Number(match.totalAmount)
        : Math.max(0, subTotal - discount);

      const viewObj = {
        appointment: {
          id: match.id,
          bookingCode: match.bookingCode,
          appointmentDate: match.appointmentDate,
          timeStart: match.timeStart,
          timeEnd: match.timeEnd,
          totalDuration: match.totalDuration || 60,
          services: servicesList,
          subTotal,
          discountAmount: discount,
          totalAmount,
          status: match.status,
          note: match.note,
        },
        customer: {
          name: "Khách hàng VELA",
          phone: trimmedPhone,
        },
        artist: {
          name: stf?.fullName || stf?.name || "Chuyên viên VELA",
          discipline: "Kỹ thuật viên VELA",
        },
      };

      setFound(viewObj);
    } catch (err) {
      setFound(null);
      setError(
        err?.response?.data?.message || err?.message || "Không tìm thấy lịch hẹn khớp với mã và số điện thoại bạn nhập.",
      );
    } finally {
      setSearching(false);
    }
  }
  return (
    <section className="gutter pb-24 pt-36 md:pt-44">
      <div className="max-w-2xl">
        <p className="eyebrow text-champagne">Khách đã đặt lịch</p>
        <AnimatedText
          as="h1"
          immediate
          lines={["TRA CỨU", "LỊCH HẸN"]}
          className="mt-6 font-display text-d2 font-light"
        />
        <p className="mt-6 max-w-[52ch] text-[1rem] leading-relaxed text-ink/55">
          Nhập mã đặt lịch trong email xác nhận cùng số điện thoại bạn đã dùng.
          Không cần tài khoản.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <form onSubmit={submit} noValidate className="space-y-7">
            <Field label="Mã đặt lịch *" hint="Ví dụ: VL260919001">
              <Input
                value={code}
                autoFocus
                placeholder="VL260919001"
                aria-invalid={Boolean(error)}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
            </Field>

            <Field label="Số điện thoại *">
              <Input
                value={phone}
                type="tel"
                autoComplete="tel"
                placeholder="0901234567"
                aria-invalid={Boolean(error)}
                onChange={(event) => setPhone(event.target.value)}
              />
            </Field>

            {error ? (
              <p
                role="alert"
                className="border-l border-signal-stop pl-3 text-[0.8125rem] leading-relaxed text-signal-stop"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Search className="size-3.5" />
              Tra cứu
            </Button>
          </form>

          <p className="mt-10 border-t border-ink/10 pt-6 text-[0.8125rem] leading-relaxed text-ink/45">
            Muốn xem tất cả lịch hẹn cũ và tích điểm?{" "}
            <Link
              href="/account/register"
              className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
            >
              Tạo tài khoản
            </Link>{" "}
            bằng chính số điện thoại này — lịch sử sẽ tự động theo về.
          </p>
        </div>

        <div className="lg:col-span-7">
          {view ? (
            <AppointmentDetail view={view} />
          ) : (
            <div className="flex h-full min-h-[18rem] items-center justify-center border border-dashed border-ink/15 px-6 py-12 text-center">
              <p className="max-w-[32ch] text-[0.875rem] leading-relaxed text-ink/40">
                Thông tin lịch hẹn sẽ hiện ở đây sau khi tra cứu.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
function AppointmentDetail({ view }) {
  const { artist, customer } = view;
  const [appointment, setAppointment] = React.useState(view.appointment);
  const [confirming, setConfirming] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [cancelling, setCancelling] = React.useState(false);
  async function cancel() {
    setCancelling(true);
    try {
      await appointmentService.cancelLookup(
        appointment.bookingCode,
        customer.phone,
        reason,
      );
      setAppointment((prev) => ({
        ...prev,
        status: "CANCELLED",
        cancellationReason: reason,
      }));
      setConfirming(false);
      setError("");
    } catch (cause) {
      setError(
        cause?.response?.data?.message || cause?.message || "Không thể hủy lịch hẹn.",
      );
    } finally {
      setCancelling(false);
    }
  }
  return (
    <Reveal>
      <article className="border border-ink/12">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/12 p-7">
          <div>
            <p className="eyebrow text-ink/40">Mã đặt lịch</p>
            <p className="mt-2.5 font-display text-[1.75rem] leading-none tracking-tight tabular">
              {appointment.bookingCode}
            </p>
          </div>
          <StatusPill status={appointment.status} />
        </header>

        <div className="p-7">
          <p className="font-display text-[2rem] leading-none tracking-tight">
            {view.serviceLabel}
          </p>
          <p className="mt-4 text-[0.9375rem] text-ink/60">
            {formatLongDate(view.date)} · {view.startTime}–{view.endTime}
          </p>

          <dl className="mt-7 divide-y divide-ink/10 border-t border-ink/10">
            <Row label="Chuyên viên" value={artist.name} />
            <Row
              label="Thời lượng"
              value={durationLabel(appointment.durationMinutes)}
            />
            <Row label="Giá đã đặt" value={currency(appointment.subTotal || appointment.price)} />
            {appointment.discount > 0 ? (
              <Row
                label={`Giảm giá${appointment.promotionCode ? ` · mã ${appointment.promotionCode}` : ""}`}
                value={`− ${currency(appointment.discount)}`}
              />
            ) : null}
            {appointment.discount > 0 ? (
              <Row
                label="Còn phải trả"
                value={currency(appointment.totalAmount != null ? appointment.totalAmount : Math.max((appointment.price || 0) - (appointment.discount || 0), 0))}
              />
            ) : null}
            <Row label="Khách hàng" value={customer.name} />
            {appointment.customerNote ? (
              <Row label="Ghi chú của bạn" value={appointment.customerNote} />
            ) : null}
            {appointment.cancellationReason ? (
              <Row label="Lý do hủy" value={appointment.cancellationReason} />
            ) : null}
          </dl>

          {CANCELLABLE.includes(appointment.status) && !confirming ? (
            <div className="mt-8 border-t border-ink/10 pt-6">
              <ReschedulePanel
                appointment={appointment}
                proof={{ phone: customer.phone }}
                artistName={artist.name}
              />
            </div>
          ) : null}

          {CANCELLABLE.includes(appointment.status) ? (
            <div className="mt-8 border-t border-ink/10 pt-6">
              {confirming ? (
                <div className="border border-ink/12 p-5">
                  <Field label="Lý do hủy *" error={error}>
                    <Input
                      autoFocus
                      value={reason}
                      maxLength={500}
                      placeholder="Ví dụ: bận công việc đột xuất"
                      onChange={(event) => setReason(event.target.value)}
                    />
                  </Field>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={!reason.trim()}
                      onClick={cancel}
                    >
                      <Check className="size-3" />
                      Xác nhận hủy
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setConfirming(false);
                        setError("");
                      }}
                    >
                      Giữ lịch hẹn
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink/45 transition-colors hover:text-signal-stop"
                >
                  <X className="size-3.5" />
                  Hủy lịch hẹn này
                </button>
              )}
            </div>
          ) : (
            <p className="mt-8 border-t border-ink/10 pt-6 text-[0.8125rem] leading-relaxed text-ink/40">
              Lịch hẹn ở trạng thái này không thể tự hủy trực tuyến. Vui lòng
              gọi salon nếu bạn cần thay đổi.
            </p>
          )}
        </div>

        <footer className="flex items-center gap-4 border-t border-ink/12 bg-paper p-7">
          {artist.portrait ? (
            <span className="relative size-12 shrink-0 overflow-hidden bg-nude/30">
              <Image
                src={artist.portrait}
                alt={artist.name || ""}
                fill
                sizes="48px"
                className="object-cover"
              />
            </span>
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center bg-nude/30 font-display text-lg font-medium text-ink/50">
              {(artist.name || "V")[0]}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[0.9375rem]">{artist.name}</p>
            <p className="mt-1 text-[0.75rem] text-ink/45">
              {artist.discipline || "Chuyên viên làm móng"}
            </p>
          </div>
          <Link
            href="/booking"
            className="eyebrow inline-flex shrink-0 items-center gap-2 border-b border-ink/25 pb-1.5 text-ink/70 transition-colors hover:border-ink hover:text-ink"
          >
            Đặt thêm
            <ArrowRight className="size-3" />
          </Link>
        </footer>
      </article>
    </Reveal>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 py-3.5">
      <dt className="text-[0.8125rem] text-ink/45">{label}</dt>
      <dd className="max-w-full text-right text-[0.9375rem] text-ink/85">
        {value}
      </dd>
    </div>
  );
}
