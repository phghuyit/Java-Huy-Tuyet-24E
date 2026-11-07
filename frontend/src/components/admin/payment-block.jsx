"use client";
import * as React from "react";
import { toast } from "sonner";
import { BanknoteArrowUp, Check, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/format";
import { formatMediumDate, splitStamp } from "@/lib/clock";
import { useAuth } from "@/lib/auth-store";
import { can } from "@/lib/permissions";
import { appointmentService } from "@/services";
import {
  PAYMENT_LABEL,
  amountDue,
  amountPaid,
  outstanding,
} from "@/lib/payments";
import { AdminSelect } from "./form-kit";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
export function PaymentBlock({ appointment, onPaymentConfirmed, onMethodChange }) {
  const { session } = useAuth();
  const allowed = can(session, "takePayment");
  const due = amountDue(appointment);
  const [method, setMethod] = React.useState("transfer");
  const [amount, setAmount] = React.useState(String(due));
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [paidState, setPaidState] = React.useState(
    appointment.payment ||
      (appointment.paymentStatus === "PAID"
        ? {
            method: appointment.paymentMethod || "transfer",
            amount: appointment.amountPaid || due,
            recordedAt: appointment.paidAt || new Date().toISOString(),
          }
        : null),
  );
  if (appointment.status !== "COMPLETED") return null;
  const paid = amountPaid(appointment);
  const left = outstanding(appointment);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const paymentData = {
        paymentStatus: "PAID",
        paymentMethod: method,
        amountPaid: Number(amount),
      };
      await appointmentService.recordPayment(appointment.id, paymentData);
      const newPayment = {
        method,
        amount: Number(amount),
        note,
        recordedAt: new Date().toISOString(),
      };
      setPaidState(newPayment);
      toast.success(`Đã xác nhận thanh toán ${currency(Number(amount))} thành công!`);
      setError("");
      onPaymentConfirmed?.({
        ...paymentData,
        payment: newPayment,
      });
    } catch (cause) {
      setError(
        cause?.response?.data?.detail ||
          cause?.response?.data?.message ||
          (cause instanceof Error ? cause.message : "Không ghi nhận được."),
      );
    } finally {
      setLoading(false);
    }
  }
  const activePayment = paidState || appointment.payment;
  if (activePayment) {
    const { date } = splitStamp(activePayment.recordedAt || new Date().toISOString());
    return (
      <div className="mt-7 border border-paper/10 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="eyebrow text-paper/45">Đã thu</span>
          <span className="font-display text-2xl tabular text-champagne">
            {currency(activePayment.amount || paid)}
          </span>
        </div>
        <p className="mt-3 flex items-center gap-2 text-sm text-paper/60">
          <Check className="size-3.5 text-signal-live" />
          {PAYMENT_LABEL[activePayment.method] || "Chuyển khoản"} · {formatMediumDate(date)}
        </p>
        {activePayment.note ? (
          <p className="mt-2 text-xs italic text-paper/45">
            “{activePayment.note}”
          </p>
        ) : null}
        {left > 0 ? (
          <p className="mt-3 border-l border-signal-warn pl-3 text-sm text-signal-warn">
            Còn thiếu {currency(left)} so với {currency(due)} phải trả.
          </p>
        ) : null}

        {allowed ? (
          <button
            type="button"
            onClick={async () => {
              try {
                await appointmentService.recordPayment(appointment.id, {
                  paymentStatus: "UNPAID",
                  amountPaid: 0,
                });
                setPaidState(null);
                toast.success("Đã hủy xác nhận thanh toán");
                onPaymentConfirmed?.({
                  paymentStatus: "UNPAID",
                  payment: null,
                  amountPaid: 0,
                });
              } catch (cause) {
                toast.error(
                  cause?.response?.data?.detail ||
                    cause?.response?.data?.message ||
                    "Không bỏ được.",
                );
              }
            }}
            className="mt-4 flex items-center gap-1.5 text-xs text-paper/40 transition-colors hover:text-signal-stop"
          >
            <Undo2 className="size-3" />
            Ghi nhầm — hủy xác nhận thanh toán
          </button>
        ) : null}
      </div>
    );
  }
  if (!allowed) {
    return (
      <p className="mt-7 border-l border-signal-warn pl-4 text-sm text-paper/55">
        Chưa thu tiền. Quầy lễ tân sẽ ghi nhận khoản {currency(due)} này.
      </p>
    );
  }
  return (
    <div className="mt-7 border border-signal-warn/40 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <span className="eyebrow flex items-center gap-2 text-signal-warn font-medium">
          <BanknoteArrowUp className="size-3.5" />
          Chưa thu tiền
        </span>
        <span className="text-sm tabular text-paper/60">
          Phải trả {currency(due)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field label="Hình thức">
          <AdminSelect
            value={method}
            onChange={(event) => {
              const val = event.target.value;
              setMethod(val);
              onMethodChange?.(val, amount);
            }}
          >
            {Object.keys(PAYMENT_LABEL).map((key) => (
              <option key={key} value={key}>
                {PAYMENT_LABEL[key]}
              </option>
            ))}
          </AdminSelect>
        </Field>
        <Field label="Số tiền (₫)">
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => {
              const val = event.target.value;
              setAmount(val);
              onMethodChange?.(method, val);
            }}
          />
        </Field>
      </div>

      <Field label="Ghi chú thanh toán" error={error} className="mt-4">
        <Input
          value={note}
          maxLength={200}
          placeholder="Ví dụ: khách chuyển khoản Vietcombank, tiền mặt..."
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>

      {Number(amount) !== due && Number(amount) > 0 ? (
        <p
          className={cn(
            "mt-3 text-xs",
            Number(amount) < due ? "text-signal-warn" : "text-paper/45",
          )}
        >
          {Number(amount) < due
            ? `Ít hơn ${currency(due - Number(amount))} so với số phải trả.`
            : `Nhiều hơn ${currency(Number(amount) - due)} so với số phải trả.`}
        </p>
      ) : null}
    </div>
  );
}
