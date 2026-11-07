"use client";
import * as React from "react";
import { Check, Hourglass } from "lucide-react";
import { useCustomerSession } from "@/lib/customer-session";
import { formatMediumDate } from "@/lib/clock";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { waitlistService } from "@/services";
export function WaitlistInvite({ serviceId, staffId, date, defaults }) {
  const { customer } = useCustomerSession();
  const [open, setOpen] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [nameEdit, setName] = React.useState(null);
  const [phoneEdit, setPhone] = React.useState(null);
  const [emailEdit, setEmail] = React.useState(null);
  const name = nameEdit ?? defaults.name ?? customer?.name ?? "";
  const phone = phoneEdit ?? defaults.phone ?? customer?.phone ?? "";
  const email = emailEdit ?? defaults.email ?? customer?.email ?? "";
  const [fromTime, setFromTime] = React.useState("");
  const [toTime, setToTime] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");
  if (done) {
    return (
      <div className="mt-6 border border-ink/12 p-5">
        <p className="flex items-center gap-2 text-[0.9375rem]">
          <Check className="size-4 text-champagne" />
          Đã ghi nhận bạn vào danh sách chờ.
        </p>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink/55">
          Salon sẽ gọi cho bạn ngay khi có chỗ trống ngày{" "}
          {formatMediumDate(date)}. Danh sách chờ{" "}
          <strong className="font-normal text-ink">không giữ chỗ</strong> — bạn
          vẫn có thể đặt một ngày khác để chắc chắn.
        </p>
      </div>
    );
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 border border-ink/20 py-4 text-[0.875rem] transition-colors hover:border-ink"
      >
        <Hourglass className="size-3.5 text-champagne" />
        Vào danh sách chờ ngày {formatMediumDate(date)}
      </button>
    );
  }
  async function submit(event) {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError("Vui lòng điền đầy đủ họ tên, số điện thoại và email.");
      return;
    }
    const localId = `wl-${Date.now()}`;
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      customerId: customer?.id ? Number(customer.id) : null,
      serviceId: serviceId && !isNaN(Number(serviceId)) ? Number(serviceId) : null,
      staffId: staffId && staffId !== "any" && !isNaN(Number(staffId)) ? Number(staffId) : null,
      desiredDate: date,
      fromTime: fromTime ? (fromTime.length === 5 ? `${fromTime}:00` : fromTime) : null,
      toTime: toTime ? (toTime.length === 5 ? `${toTime}:00` : toTime) : null,
      note: note.trim() || "",
      status: "WAITING",
    };

    try {
      let created = null;
      try {
        created = await waitlistService.create(payload);
      } catch (apiErr) {
        console.warn("Backend waitlist API error (fallback to local):", apiErr);
      }

      if (typeof window !== "undefined") {
        try {
          const entry = {
            id: created?.id ? String(created.id) : localId,
            ...payload,
            date: payload.desiredDate,
            createdAt: created?.createdAt || new Date().toISOString(),
          };
          let existing = [];
          const raw = localStorage.getItem("vela_waitlist");
          if (raw) existing = JSON.parse(raw);
          if (!Array.isArray(existing)) existing = [];
          localStorage.setItem("vela_waitlist", JSON.stringify([entry, ...existing]));
          window.dispatchEvent(new Event("vela:waitlist_updated"));
        } catch (_) {}
      }

      setDone(true);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không ghi nhận được.");
    }
  }
  return (
    <form
      onSubmit={submit}
      noValidate
      className="mt-6 border border-ink/12 p-5"
    >
      <p className="text-[0.875rem] leading-relaxed text-ink/60">
        Để lại thông tin, salon sẽ gọi ngay khi có người hủy lịch ngày{" "}
        {formatMediumDate(date)}.
      </p>

      <div className="mt-5 space-y-5">
        <Field label="Họ và tên *">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Số điện thoại *">
            <Input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field label="Email *">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Rảnh từ" hint="Để trống nếu giờ nào cũng được.">
            <Input
              type="time"
              value={fromTime}
              onChange={(event) => setFromTime(event.target.value)}
            />
          </Field>
          <Field label="Đến">
            <Input
              type="time"
              value={toTime}
              onChange={(event) => setToTime(event.target.value)}
            />
          </Field>
        </div>

        <Field label="Ghi chú" error={error}>
          <Textarea
            rows={2}
            value={note}
            maxLength={300}
            placeholder="Ví dụ: em chỉ rảnh buổi sáng."
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" type="submit">
          Gửi yêu cầu chờ
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => setOpen(false)}
        >
          Thôi
        </Button>
      </div>

      <p className="mt-4 text-[0.75rem] leading-relaxed text-ink/40">
        Đây không phải lịch hẹn và không giữ chỗ cho bạn.
      </p>
    </form>
  );
}
