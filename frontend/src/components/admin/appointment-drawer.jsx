"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  qualifiedStaff,
  STATUS_TRANSITIONS,
} from "@/lib/salon";
import { TODAY, durationLabel, formatLongDate } from "@/lib/clock";
import { currency } from "@/lib/format";
import { netPrice } from "@/lib/promotions";
import { PaymentBlock } from "./payment-block";
import { RightDrawer } from "@/components/ui/right-drawer";
import { STATUS_META, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { AdminSelect, FormError } from "./form-kit";
import { appointmentService } from "@/services";

const ACTION_LABEL = {
  CONFIRMED: "Xác nhận lịch",
  CHECKED_IN: "Khách đã đến",
  IN_SERVICE: "Bắt đầu phục vụ",
  COMPLETED: "Hoàn thành",
  NO_SHOW: "Đánh dấu không đến",
};

export function AppointmentDrawer({ view, onClose, onRefresh }) {
  if (!view) return null;
  return (
    <AppointmentDetail
      key={view.appointment.id}
      view={view}
      onClose={onClose}
      onRefresh={onRefresh}
    />
  );
}

function AppointmentDetail({ view, onClose, onRefresh }) {
  const { customer, artist } = view;
  const [currentAppt, setCurrentAppt] = React.useState(view.appointment);
  const [currentDate, setCurrentDate] = React.useState(view.date);
  const [currentTime, setCurrentTime] = React.useState(view.startTime);
  const appointment = currentAppt;
  const [editing, setEditing] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [staffId, setStaffId] = React.useState(appointment.staffId);
  const [date, setDate] = React.useState(currentDate);
  const [time, setTime] = React.useState(currentTime);
  const [adminNote, setAdminNote] = React.useState(appointment.adminNote || "");
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState("");

  const transitions = STATUS_TRANSITIONS[appointment.status] || [];
  const canMove = ["PENDING", "CONFIRMED"].includes(appointment.status);
  const [payMethod, setPayMethod] = React.useState("transfer");
  const [payAmount, setPayAmount] = React.useState(null);
  const isPaid =
    appointment.paymentStatus === "PAID" ||
    Boolean(appointment.payment && Number(appointment.payment.amount) > 0);

  async function quickConfirmPayment() {
    try {
      const due = netPrice(appointment);
      const actualAmount = Number(payAmount) > 0 ? Number(payAmount) : due;
      const actualMethod = payMethod || "transfer";

      await appointmentService.recordPayment(appointment.id, {
        paymentStatus: "PAID",
        paymentMethod: actualMethod,
        amountPaid: actualAmount,
      });

      const newPayment = {
        method: actualMethod,
        amount: actualAmount,
        recordedAt: new Date().toISOString(),
      };

      setCurrentAppt((prev) => ({
        ...prev,
        paymentStatus: "PAID",
        paymentMethod: actualMethod,
        amountPaid: actualAmount,
        payment: newPayment,
      }));

      toast.success(`Đã xác nhận thanh toán ${currency(actualAmount)} thành công!`);
      if (typeof onRefresh === "function") {
        onRefresh();
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Không thể ghi nhận thanh toán.",
      );
    }
  }
  const slots = [
    "09:00", "09:30", "10:00", "10:30", "11:00",
    "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ].map((t) => ({ time: t, available: true }));

  async function move(status) {
    try {
      await appointmentService.update(appointment.id, {
        status,
        cancellationReason: reason || "",
      });
      setCurrentAppt((prev) => ({
        ...prev,
        status,
        cancellationReason: reason || prev.cancellationReason,
      }));
      setCancelling(false);
      setError("");
      toast.success(`Lịch hẹn: ${STATUS_META[status]?.label || status}`);
      if (typeof onRefresh === "function") {
        onRefresh();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Không thể cập nhật lịch hẹn.",
      );
    }
  }

  async function moveToWaitlist() {
    try {
      if (typeof window !== "undefined") {
        const entry = {
          id: `wl-${Date.now()}`,
          customerId: appointment.customerId || null,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          serviceId: appointment.services?.[0]?.serviceId || appointment.serviceIds?.[0] || 1,
          staffId: appointment.staffId || "any",
          date: currentDate,
          fromTime: currentTime,
          toTime: null,
          note: `Chuyển từ đơn ${appointment.bookingCode}`,
          status: "WAITING",
          createdAt: new Date().toISOString(),
          appointmentId: appointment.id,
        };
        let existing = [];
        try {
          const stored = localStorage.getItem("vela_waitlist");
          if (stored) existing = JSON.parse(stored);
        } catch (_) {}
        if (!Array.isArray(existing)) {
          existing = [];
        }
        localStorage.setItem("vela_waitlist", JSON.stringify([entry, ...existing]));
      }

      await appointmentService.update(appointment.id, {
        status: "CANCELLED",
        cancellationReason: "Chuyển vào danh sách chờ",
      });

      toast.success(`Đã chuyển ${customer.name} vào danh sách chờ`);
      if (typeof onRefresh === "function") {
        onRefresh();
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Không thể chuyển vào danh sách chờ.",
      );
    }
  }

  async function save() {
    try {
      await appointmentService.update(appointment.id, {
        staffId,
        appointmentDate: date,
        startTime: time,
        notes: adminNote,
      });
      setCurrentDate(date);
      setCurrentTime(time);
      setCurrentAppt((prev) => ({
        ...prev,
        staffId,
        adminNote,
      }));
      setEditing(false);
      setError("");
      toast.success("Đã lưu lịch hẹn");
      if (typeof onRefresh === "function") {
        onRefresh();
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Không thể lưu lịch hẹn.",
      );
    }
  }
  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      eyebrow={appointment.bookingCode}
      title={customer.name}
      footer={
        <div className="flex flex-wrap gap-2">
          {appointment.status === "COMPLETED" && !isPaid && (
            <Button
              variant="champagne"
              onClick={quickConfirmPayment}
              className="font-semibold shadow"
            >
              ✓ Xác nhận đã thu {currency(Number(payAmount) > 0 ? Number(payAmount) : netPrice(appointment))}
            </Button>
          )}
          {!cancelling &&
            transitions
              .filter((status) => status !== "CANCELLED")
              .map((status) => (
                <Button
                  key={status}
                  variant={status === "NO_SHOW" ? "danger" : "champagne"}
                  onClick={() => move(status)}
                >
                  {ACTION_LABEL[status]}
                </Button>
              ))}
          {transitions.includes("CANCELLED") && !cancelling && (
            <>
              <Button
                variant="outlineLight"
                onClick={moveToWaitlist}
              >
                Chuyển vào DS chờ
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setCancelling(true);
                  setError("");
                }}
              >
                Hủy lịch
              </Button>
            </>
          )}
          {cancelling && (
            <>
              <Button
                variant="danger"
                disabled={!reason.trim()}
                onClick={() => move("CANCELLED")}
              >
                Xác nhận hủy
              </Button>
              <Button variant="ghostLight" onClick={() => setCancelling(false)}>
                Giữ lịch hẹn
              </Button>
            </>
          )}
        </div>
      }
    >
      <StatusPill status={appointment.status} pulse />
      <div className="mt-7 border-t border-paper/10 pt-6">
        <p className="font-display text-[2.5rem] leading-none tabular">
          {view.startTime} — {view.endTime}
        </p>
        <p className="mt-3 text-[0.875rem] text-paper/60">
          {formatLongDate(view.date)} ·{" "}
          {durationLabel(appointment.durationMinutes || appointment.totalDuration || view?.durationMin || 45)}
        </p>
      </div>
      <dl className="mt-6 divide-y divide-paper/10">
        <DetailRow label="Dịch vụ">{view.serviceLabel}</DetailRow>
        <DetailRow label="Nhân viên">
          <Link
            className="text-champagne underline underline-offset-4"
            href={`/admin/staff/${artist.id}`}
          >
            {artist.name}
          </Link>
        </DetailRow>
        <DetailRow label="Giá đã đặt">{currency(appointment.subTotal || appointment.price)}</DetailRow>
        {appointment.discount > 0 ? (
          <>
            <DetailRow label="Giảm giá">
              − {currency(appointment.discount)}
              {appointment.promotionCode ? ` · mã ${appointment.promotionCode}` : ""}
            </DetailRow>
            <DetailRow label="Khách phải trả">
              {currency(netPrice(appointment))}
            </DetailRow>
          </>
        ) : null}
        <DetailRow label="Khách hàng">
          <Link
            className="text-champagne underline underline-offset-4"
            href={`/admin/customers/${customer.id}`}
          >
            {customer.name}
          </Link>
        </DetailRow>
        <DetailRow label="Điện thoại">
          <a href={`tel:${customer.phone}`}>{customer.phone}</a>
        </DetailRow>
        <DetailRow label="Email">
          <a className="break-all" href={`mailto:${customer.email}`}>
            {customer.email}
          </a>
        </DetailRow>
        <DetailRow label="Ghi chú của khách">
          {appointment.customerNote || "Không có ghi chú"}
        </DetailRow>
        {appointment.cancellationReason && (
          <DetailRow label="Lý do hủy">
            {appointment.cancellationReason}
          </DetailRow>
        )}
      </dl>

      <PaymentBlock
        appointment={appointment}
        onMethodChange={(m, a) => {
          setPayMethod(m);
          setPayAmount(a);
        }}
        onPaymentConfirmed={(paymentUpdate) => {
          setCurrentAppt((prev) => ({
            ...prev,
            ...paymentUpdate,
          }));
          if (typeof onRefresh === "function") {
            onRefresh();
          }
        }}
      />
      <ReliabilityNote customerId={customer.id} />
      <div className="mt-6 space-y-5 border-t border-paper/10 pt-6">
        <Field label="Ghi chú quản trị">
          <Textarea
            maxLength={500}
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            placeholder="Ghi chú nội bộ cho buổi hẹn"
          />
        </Field>
        {canMove && (
          <Button
            variant="outlineLight"
            onClick={() => {
              setEditing((value) => !value);
              setError("");
            }}
          >
            {editing ? "Đóng chỉnh lịch" : "Đổi lịch / nhân viên"}
          </Button>
        )}
        {editing && canMove && (
          <div className="space-y-5">
            <Field label="Nhân viên">
              <AdminSelect
                value={staffId}
                onChange={(event) => {
                  setStaffId(event.target.value);
                  setTime("");
                }}
              >
                <option value={staffId}>{artist.name}</option>
              </AdminSelect>
            </Field>
            <Field label="Ngày hẹn">
              <Input
                type="date"
                min={TODAY}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setTime("");
                }}
              />
            </Field>
            <Field label="Giờ hẹn">
              <AdminSelect
                value={time}
                onChange={(event) => setTime(event.target.value)}
              >
                <option value="">Chọn giờ trống</option>
                {!slots.some((slot) => slot.time === view.startTime) &&
                  date === view.date &&
                  staffId === appointment.staffId && (
                    <option value={view.startTime}>
                      {view.startTime} (giờ hiện tại)
                    </option>
                  )}
                {slots.map((slot) => (
                  <option key={slot.time} value={slot.time}>
                    {slot.time}
                  </option>
                ))}
              </AdminSelect>
            </Field>
            {!slots.length && (
              <p className="text-[0.8125rem] text-paper/45">
                Không còn giờ trống. Vui lòng chọn ngày hoặc nhân viên khác.
              </p>
            )}
          </div>
        )}
        <Button
          variant="outlineLight"
          disabled={editing && !time}
          onClick={save}
        >
          {editing ? "Lưu thông tin đổi lịch" : "Lưu ghi chú quản trị"}
        </Button>
        <p className="text-[11px] text-paper/35">
          * Trạng thái và thanh toán được lưu tự động ngay khi bấm nút tương ứng.
        </p>
      </div>
      {cancelling && (
        <div className="mt-6">
          <Field label="Lý do hủy *">
            <Textarea
              autoFocus
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Nhập lý do hủy lịch"
              maxLength={500}
            />
          </Field>
        </div>
      )}
      <div className="mt-5">
        <FormError message={error} />
      </div>
      <p className="mt-7 text-[0.6875rem] text-paper/35">
        Mã đặt lịch: {appointment.bookingCode}. Giá và thời lượng được lưu tại
        thời điểm đặt.
      </p>
    </RightDrawer>
  );
}
function DetailRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 py-3.5">
      <dt className="text-[0.8125rem] text-paper/40">{label}</dt>
      <dd className="max-w-full text-right text-[0.875rem]">{children}</dd>
    </div>
  );
}
function ReliabilityNote({ customerId }) {
  return null;
}
