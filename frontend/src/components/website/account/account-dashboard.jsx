"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarPlus,
  Check,
  Loader2,
  LogOut,
  Pencil,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TODAY, formatLongDate, formatMediumDate, durationLabel } from "@/lib/clock";
import { currency } from "@/lib/format";
import { useCustomerSession, startCustomerSession } from "@/lib/customer-session";
import { POINT_RATE, pointsFromSpend, tierProgress } from "@/lib/loyalty";
import { StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedText } from "@/components/motion/animated-text";
import { PasswordCard } from "./password-card";
import { ReviewBlock } from "./review-block";
import { ReschedulePanel } from "@/components/booking/reschedule-panel";
import {
  appointmentService,
  nailService,
  staffService,
  userService,
} from "@/services";

const OPEN_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_SERVICE"];

export function AccountDashboard() {
  const router = useRouter();
  const { customer, ready, isAuthenticated, logout } = useCustomerSession();
  const signingOut = React.useRef(false);

  React.useEffect(() => {
    if (signingOut.current) return;
    if (ready && !isAuthenticated) {
      router.replace("/account/login?next=%2Faccount");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !customer) {
    return (
      <div className="gutter flex min-h-[60vh] items-center justify-center pt-36">
        <Loader2 className="size-5 animate-spin text-ink/30" />
        <span className="sr-only">Đang tải tài khoản…</span>
      </div>
    );
  }

  return (
    <AccountView
      key={customer.id}
      customer={customer}
      customerId={customer.id}
      onLogout={() => {
        signingOut.current = true;
        logout();
        router.replace("/");
      }}
    />
  );
}

function AccountView({ customer: customerProp, customerId, onLogout }) {
  const [customer, setCustomer] = React.useState(customerProp);
  const [views, setViews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const [apptsRes, svcsRes, staffRes] = await Promise.allSettled([
        appointmentService.getMy(customerId),
        nailService.getAll(),
        staffService.getAll(),
      ]);

      const rawAppts = apptsRes.status === "fulfilled" && Array.isArray(apptsRes.value) ? apptsRes.value : [];
      const rawSvcs = svcsRes.status === "fulfilled" && Array.isArray(svcsRes.value) ? svcsRes.value : [];
      const rawStaff = staffRes.status === "fulfilled" && Array.isArray(staffRes.value) ? staffRes.value : [];

      let activePhone = customer.phone;
      let activeEmail = customer.email;
      try {
        const uProfile = await userService.getMyProfile();
        if (uProfile && (!uProfile.roleCode || uProfile.roleCode.toUpperCase() === "CUSTOMER")) {
          activePhone = uProfile.phone || activePhone;
          activeEmail = uProfile.email || activeEmail;
          if (String(uProfile.id) !== String(customer.id)) {
            const synced = {
              ...customer,
              ...uProfile,
              id: String(uProfile.id),
              name: uProfile.fullName || uProfile.name || customer.name,
              phone: uProfile.phone || customer.phone,
              email: uProfile.email || customer.email,
            };
            setCustomer(synced);
            startCustomerSession(synced);
          }
        }
      } catch {}

      const svcMap = new Map(rawSvcs.map((s) => [String(s.id), s]));
      const staffMap = new Map(rawStaff.map((st) => [String(st.id), st]));

      const cleanPhone = (p) => (p || "").replace(/\D/g, "");
      const cleanEmail = (e) => (e || "").trim().toLowerCase();

      const matchedViews = rawAppts
        .filter((a) => {
          const aCustId = String(a.customerId || a.customer?.id || a.userId || "");
          const matchId = aCustId && aCustId === String(customerId);

          const apptPhone = cleanPhone(a.customerPhone || a.customer?.phone || a.phone);
          const custPhone = cleanPhone(activePhone);
          const matchPhone = custPhone && apptPhone && (custPhone === apptPhone || custPhone.endsWith(apptPhone) || apptPhone.endsWith(custPhone));

          const apptEmail = cleanEmail(a.customerEmail || a.customer?.email || a.email);
          const custEmail = cleanEmail(activeEmail);
          const matchEmail = custEmail && apptEmail && custEmail === apptEmail;

          return matchId || matchPhone || matchEmail;
        })
        .map((a) => {
          const stf = staffMap.get(String(a.staffId || a.staff?.id)) || a.staff || { name: "Chuyên viên VELA" };

          const servicesList = (a.services || a.serviceDetails || a.appointmentServices || []).map((item) => {
            const sId = String(item.serviceId || item.nailServiceId || item.id);
            const found = svcMap.get(sId) || item;
            return {
              id: sId,
              name: found.name || item.serviceName || "Dịch vụ",
              price: Number(item.price || found.price || 0),
              durationMin: Number(found.durationMin || item.durationMin || 45),
            };
          });

          const servicesSum = servicesList.reduce((sum, s) => sum + s.price, 0);
          const resolvedPrice = Number(
            a.totalAmount ??
            a.price ??
            a.totalPrice ??
            a.subTotal ??
            servicesSum
          ) || 0;

          const serviceLabel = servicesList.map((s) => s.name).join(", ") || a.serviceName || "Dịch vụ VELA";
          const durationMin = servicesList.reduce((sum, s) => sum + (s.durationMin || 45), 0) || a.durationMin || a.totalDuration || 45;
          const timeStart = (a.timeStart || a.startTime || "09:00").slice(0, 5);
          const timeEnd = (a.timeEnd || a.endTime || "10:00").slice(0, 5);

          return {
            appointment: {
              id: String(a.id),
              status: a.status || "CONFIRMED",
              bookingCode: a.bookingCode || `VL${a.id}`,
              date: a.appointmentDate || a.date || TODAY,
              startTime: timeStart,
              endTime: timeEnd,
              durationMinutes: durationMin,
              totalDuration: durationMin,
              staffId: String(stf.id || a.staffId || "1"),
              totalPrice: resolvedPrice,
              totalAmount: resolvedPrice,
              price: resolvedPrice,
              discount: Number(a.discount || a.discountAmount || 0),
              customerId: String(customerId),
              cancellationReason: a.cancellationReason || null,
              serviceIds: (a.services || []).map((s) => s.serviceId || s.id),
              services: a.services || [],
            },
            services: servicesList,
            serviceLabel,
            artist: {
              id: String(stf.id || "1"),
              name: stf.name || stf.fullName || "Chuyên viên VELA",
            },
            date: a.appointmentDate || a.date || TODAY,
            startTime: timeStart,
            endTime: timeEnd,
            durationMin,
          };
        });

      setViews(matchedViews);
    } catch (err) {
      console.error("Failed to load customer dashboard appointments:", err);
    } finally {
      setLoading(false);
    }
  }, [customer, customerId]);

  React.useEffect(() => {
    fetchDashboardData();

    const handleFocus = () => {
      fetchDashboardData();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchDashboardData]);

  const upcoming = views
    .filter((view) => OPEN_STATUSES.includes(view.appointment.status) && view.date >= TODAY)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return Number(b.appointment.id || 0) - Number(a.appointment.id || 0);
    });

  const history = views
    .filter((view) => !upcoming.includes(view))
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return Number(b.appointment.id || 0) - Number(a.appointment.id || 0);
    });

  const completedViews = views.filter((v) => v.appointment.status === "COMPLETED");
  const totalSpend = completedViews.reduce((sum, v) => sum + v.appointment.price, 0);
  const stats = {
    totalAppointments: views.length,
    completed: completedViews.length,
    totalSpend,
    lastAppointment: views[0]?.date || null,
  };

  const points = pointsFromSpend(stats.totalSpend);
  const { tier, next, remaining, progress } = tierProgress(points);

  return (
    <div className="gutter pb-24 pt-36 md:pt-44">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-10">
        <div>
          <p className="eyebrow text-champagne">Tài khoản của bạn</p>
          <AnimatedText
            as="h1"
            immediate
            lines={[customer.name]}
            className="mt-5 font-display text-d2 font-light"
          />
          <p className="mt-4 text-[0.9375rem] text-ink/50">
            Thành viên từ {formatMediumDate(customer.createdAt || TODAY)} · hạng{" "}
            <span className="text-ink">{tier.name}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link href="/booking">
              <CalendarPlus className="size-3.5" />
              Đặt lịch mới
            </Link>
          </Button>
          <button
            type="button"
            onClick={onLogout}
            className="eyebrow flex items-center gap-2 py-2 text-ink/45 transition-colors hover:text-ink"
          >
            <LogOut className="size-3.5" />
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="space-y-14 lg:col-span-7">
          <LoyaltyCard
            points={points}
            tierName={tier.name}
            perk={tier.perk}
            nextName={next?.name ?? null}
            remaining={remaining}
            progress={progress}
          />

          <Section title="Lịch hẹn sắp tới" count={upcoming.length}>
            {upcoming.length ? (
              <ul className="border-t border-ink/12">
                {upcoming.map((view) => (
                  <AppointmentRow
                    key={view.appointment.id}
                    view={view}
                    customer={customer}
                    cancellable
                    onRefresh={fetchDashboardData}
                  />
                ))}
              </ul>
            ) : (
              <EmptyRow
                message="Bạn chưa có lịch hẹn nào sắp tới."
                action={{ label: "Đặt lịch ngay", href: "/booking" }}
              />
            )}
          </Section>

          <Section title="Lịch sử" count={history.length}>
            {history.length ? (
              <ul className="border-t border-ink/12">
                {history.map((view) => (
                  <AppointmentRow
                    key={view.appointment.id}
                    view={view}
                    customer={customer}
                    onRefresh={fetchDashboardData}
                  />
                ))}
              </ul>
            ) : (
              <EmptyRow message="Chưa có lịch hẹn nào trong lịch sử." />
            )}
          </Section>
        </div>

        <aside className="space-y-10 lg:col-span-5">
          <div className="grid grid-cols-2 border-y border-ink/12">
            <Figure label="Tổng lịch hẹn" value={`${stats.totalAppointments}`} />
            <Figure label="Đã hoàn thành" value={`${stats.completed}`} bordered />
            <Figure
              label="Tổng chi tiêu"
              value={currency(stats.totalSpend)}
              className="border-t border-ink/12"
            />
            <Figure
              label="Lần gần nhất"
              value={stats.lastAppointment ? formatMediumDate(stats.lastAppointment) : "—"}
              bordered
              className="border-t border-ink/12"
            />
          </div>

          <ProfileCard
            customerId={customerId}
            customer={customer}
            onUpdate={(updated) => {
              setCustomer(updated);
              startCustomerSession(updated);
            }}
          />

          <PasswordCard customerId={customerId} />
        </aside>
      </div>
    </div>
  );
}

function LoyaltyCard({
  points,
  tierName,
  perk,
  nextName,
  remaining,
  progress,
}) {
  return (
    <Reveal>
      <div
        className="relative overflow-hidden bg-void p-7 text-paper md:p-9"
        data-tone="dark"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow text-champagne">Điểm tích lũy</p>
            <p className="mt-5 font-display text-[4rem] leading-none tracking-tight tabular md:text-[5rem]">
              {points.toLocaleString("vi-VN")}
            </p>
            <p className="mt-4 text-[0.8125rem] text-paper/45">
              1 điểm cho mỗi {currency(POINT_RATE)} đã sử dụng dịch vụ
            </p>
          </div>

          <div className="border border-champagne/40 px-4 py-2.5">
            <p className="eyebrow text-champagne">Hạng {tierName}</p>
          </div>
        </div>

        <p className="mt-7 text-[0.875rem] leading-relaxed text-paper/60">
          {perk}
        </p>

        <div className="mt-8 border-t border-paper/15 pt-6">
          <div className="flex items-baseline justify-between gap-4 text-[0.75rem]">
            <span className="text-paper/45">
              {nextName
                ? `Còn ${remaining} điểm lên hạng ${nextName}`
                : "Bạn đang ở hạng cao nhất"}
            </span>
            <span className="tabular text-paper/35">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="mt-3 h-px w-full bg-paper/15">
            <div
              className="h-px bg-champagne transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${Math.max(2, progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function AppointmentRow({ view, cancellable, onRefresh, customer }) {
  const [confirming, setConfirming] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");
  const [cancelling, setCancelling] = React.useState(false);

  async function cancel() {
    setCancelling(true);
    try {
      await appointmentService.cancelMy(view.appointment.id, reason);
      setConfirming(false);
      setError("");
      if (typeof onRefresh === "function") {
        onRefresh();
      }
    } catch (cause) {
      setError(
        cause?.response?.data?.detail ||
          cause?.response?.data?.message ||
          cause?.message ||
          "Không thể hủy lịch hẹn.",
      );
    } finally {
      setCancelling(false);
    }
  }

  const canCancel = cancellable && ["PENDING", "CONFIRMED"].includes(view.appointment.status);
  const rawPrice = Number(view.appointment.price || view.appointment.totalAmount || 0);
  const discount = Number(view.appointment.discount || 0);
  const net = Math.max(rawPrice - discount, 0);

  return (
    <li className="border-b border-ink/12 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="font-display text-[1.5rem] leading-none tracking-tight">
            {view.serviceLabel}
          </p>
          <p className="mt-2.5 text-[0.8125rem] text-ink/50">
            {formatLongDate(view.date)} · {view.startTime}–{view.endTime} ·{" "}
            {durationLabel(view.durationMin)}
          </p>
          <p className="mt-1 text-[0.8125rem] text-ink/40">
            Chuyên viên {view.artist.name} · mã {view.appointment.bookingCode}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <span className="text-[0.9375rem] tabular text-ink">
            {discount > 0 ? (
              <>
                <s className="mr-2 text-ink/30">{currency(rawPrice)}</s>
                {currency(net)}
              </>
            ) : (
              currency(rawPrice)
            )}
          </span>
          <StatusPill status={view.appointment.status} />
        </div>
      </div>

      {view.appointment.cancellationReason ? (
        <p className="mt-3 border-l border-ink/15 pl-3 text-[0.8125rem] text-ink/40">
          Lý do hủy: {view.appointment.cancellationReason}
        </p>
      ) : null}

      {canCancel ? (
        confirming ? (
          <div className="mt-4 border border-ink/12 p-4">
            <Field label="Lý do hủy *" error={error}>
              <Input
                autoFocus
                value={reason}
                maxLength={500}
                placeholder="Ví dụ: bận công việc đột xuất"
                onChange={(event) => setReason(event.target.value)}
              />
            </Field>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="danger"
                disabled={!reason.trim() || cancelling}
                onClick={cancel}
              >
                {cancelling ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                Xác nhận hủy
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={cancelling}
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
            className="mt-3 inline-flex items-center gap-1.5 text-[0.75rem] text-ink/40 transition-colors hover:text-signal-stop"
          >
            <X className="size-3" />
            Hủy lịch hẹn này
          </button>
        )
      ) : null}

      {canCancel && !confirming ? (
        <ReschedulePanel
          appointment={view.appointment}
          proof={{
            customerId: view.appointment.customerId,
            name: customer?.name,
            phone: customer?.phone,
            email: customer?.email,
          }}
          artistName={view.artist.name}
          onRescheduled={onRefresh}
        />
      ) : null}

      {view.appointment.status === "COMPLETED" ? (
        <ReviewBlock
          appointmentId={view.appointment.id}
          customerId={view.appointment.customerId}
          artistName={view.artist.name}
        />
      ) : null}
    </li>
  );
}

function ProfileCard({ customerId, customer, onUpdate }) {
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(customer?.name || "");
  const [phone, setPhone] = React.useState(customer?.phone || "");
  const [email, setEmail] = React.useState(customer?.email || "");
  const [error, setError] = React.useState("");
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const updated = {
        ...customer,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };
      await userService.updateMyProfile({
        fullName: updated.name,
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
      });

      if (typeof onUpdate === "function") {
        onUpdate(updated);
      }
      setEditing(false);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch (cause) {
      setError(
        cause?.response?.data?.detail ||
          cause?.response?.data?.message ||
          cause?.message ||
          "Không thể lưu hồ sơ.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-ink/12 p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="eyebrow text-ink/45">Thông tin liên hệ</h2>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-[0.75rem] text-ink/40 transition-colors hover:text-ink"
          >
            <Pencil className="size-3" />
            Chỉnh sửa
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-6 space-y-6">
          <Field label="Họ và tên">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field label="Số điện thoại">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </Field>
          <Field label="Email" error={error}>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={saving} onClick={save}>
              {saving ? <Loader2 className="size-3 animate-spin" /> : null}
              Lưu thay đổi
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setError("");
                setName(customer.name);
                setPhone(customer.phone);
                setEmail(customer.email);
              }}
            >
              Hủy
            </Button>
          </div>
        </div>
      ) : (
        <dl className="mt-6 space-y-4">
          <Row label="Họ và tên" value={customer.name} />
          <Row label="Số điện thoại" value={customer.phone} />
          <Row label="Email" value={customer.email} />
        </dl>
      )}

      {saved ? (
        <p
          role="status"
          className="mt-5 flex items-center gap-2 text-[0.8125rem] text-ink/50"
        >
          <Check className="size-3.5 text-champagne" />
          Đã lưu thông tin.
        </p>
      ) : null}
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-[1.75rem] leading-none tracking-tight">
          {title}
        </h2>
        <span className="eyebrow tabular text-ink/30">{count}</span>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function EmptyRow({ message, action }) {
  return (
    <div className="border border-dashed border-ink/15 px-6 py-10 text-center">
      <p className="text-[0.875rem] text-ink/45">{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="eyebrow mt-5 inline-flex items-center gap-2 border-b border-ink/25 pb-1.5 text-ink/70 transition-colors hover:border-ink hover:text-ink"
        >
          {action.label}
          <ArrowRight className="size-3" />
        </Link>
      ) : null}
    </div>
  );
}

function Figure({ label, value, bordered, className }) {
  return (
    <div
      className={cn(
        "px-5 py-6",
        bordered && "border-l border-ink/12",
        className,
      )}
    >
      <p className="eyebrow text-ink/40">{label}</p>
      <p className="mt-3 font-display text-[1.5rem] leading-none tracking-tight tabular">
        {value}
      </p>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[0.8125rem] text-ink/40">{label}</dt>
      <dd className="text-right text-[0.9375rem] text-ink/80">{value}</dd>
    </div>
  );
}
