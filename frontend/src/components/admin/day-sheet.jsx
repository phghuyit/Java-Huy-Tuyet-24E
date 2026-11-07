"use client";
import { durationLabel, formatLongDate, formatMediumDate } from "@/lib/clock";
import { currency } from "@/lib/format";
import { netPrice } from "@/lib/promotions";
import { awaitingPayment } from "@/lib/payments";
import { STATUS_META } from "@/components/ui/badge";
export function DaySheet({ date, rows = [], staff = [], leave = [], hours }) {
  const live = rows.filter(
    (view) => !["CANCELLED", "NO_SHOW"].includes(view.appointment.status),
  );
  const dropped = rows.filter((view) =>
    ["CANCELLED", "NO_SHOW"].includes(view.appointment.status),
  );
  const revenue = live.reduce(
    (sum, view) => sum + netPrice(view.appointment),
    0,
  );
  return (
    <div className="hidden print:block">
      <header className="mb-5 border-b-2 border-black pb-4">
        <div className="flex items-baseline justify-between gap-6">
          <p className="font-display text-[1.75rem] leading-none tracking-tight">
            VELA.
          </p>
          <p className="text-[0.6875rem] uppercase tracking-[0.2em]">
            Phiếu lịch ngày
          </p>
        </div>

        <h1 className="mt-4 font-display text-[2rem] leading-none tracking-tight">
          {formatLongDate(date)}
        </h1>

        <p className="mt-3 text-[0.75rem]">
          {live.length} lịch hẹn · {currency(revenue)} dự kiến · {staff.length}{" "}
          nhân viên · mở cửa 09:00–20:00
        </p>
      </header>

      {staff.map((member) => {
        const mine = live
          .filter((view) => view.artist.id === member.id)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        const allDay = Array.isArray(leave)
          ? leave.find((item) => item.staffId === member.id && (item.allDay || !item.startTime))
          : null;
        return (
          <section key={member.id} className="mb-5 break-inside-avoid">
            <div className="flex items-baseline justify-between gap-4 border-b border-black pb-1.5 pr-1">
              <h2 className="text-[1rem] font-semibold">{member.name}</h2>
              <span className="text-[0.75rem]">
                {mine.length} lịch · {currency(mine.reduce((sum, v) => sum + netPrice(v.appointment), 0))}
              </span>
            </div>

            {mine.length ? (
              <table className="w-full border-collapse text-[0.6875rem]">
                <thead>
                  <tr className="border-b border-black/30 text-left">
                    <th className="w-[3.75rem] py-1.5 pr-3 font-normal">Giờ</th>
                    <th className="py-1.5 pr-3 font-normal">Khách hàng</th>
                    <th className="py-1.5 pr-3 font-normal">Dịch vụ</th>
                    <th className="w-[5.25rem] py-1.5 pr-3 text-right font-normal">
                      Giá
                    </th>
                    <th className="w-[4.75rem] py-1.5 pr-3 font-normal">TT</th>
                    <th className="w-[6rem] border-l border-black/15 py-1.5 pl-3 font-normal">
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((view) => (
                    <tr
                      key={view.appointment.id}
                      className="break-inside-avoid border-b border-black/15 align-top"
                    >
                      <td className="py-1.5 pr-3 tabular">
                        {view.startTime}
                        <span className="block text-black/50">
                          {view.endTime}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3">
                        {view.customer.name}
                        <span className="block tabular text-black/60">
                          {view.customer.phone} · {view.appointment.bookingCode}
                        </span>
                      </td>
                      <td className="py-1.5 pr-3">
                        {view.serviceLabel}
                        <span className="block text-black/50">
                          {durationLabel(view.appointment.durationMinutes)}
                        </span>
                        {view.appointment.customerNote ? (
                          <span className="mt-1 block italic text-black/70">
                            “{view.appointment.customerNote}”
                          </span>
                        ) : null}
                      </td>
                      <td className="py-1.5 pr-3 text-right tabular">
                        {currency(netPrice(view.appointment))}
                        {awaitingPayment(view.appointment) ? (
                          <span className="block font-semibold">chưa thu</span>
                        ) : null}
                        {view.appointment.discount > 0 && view.appointment.promotionCode ? (
                          <span className="block text-black/50">
                            mã {view.appointment.promotionCode}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-1.5 pr-3">
                        {STATUS_META[view.appointment.status].label}
                      </td>
                      <td className="border-l border-black/15 py-1.5" />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-2 text-[0.75rem] text-black/50">
                {allDay
                  ? `Nghỉ cả ngày — ${allDay.reason || "Lịch nghỉ"}.`
                  : "Không có lịch hẹn."}
              </p>
            )}
          </section>
        );
      })}

      {dropped.length ? (
        <section className="mt-8 break-inside-avoid border-t border-black/30 pt-3">
          <h2 className="text-[0.6875rem] uppercase tracking-[0.18em]">
            Đã hủy / không đến
          </h2>
          <ul className="mt-2 text-[0.75rem]">
            {dropped.map((view) => (
              <li key={view.appointment.id} className="py-0.5">
                {view.startTime} · {view.customer.name} · {view.serviceLabel} ·{" "}
                {view.artist.name} ·{" "}
                {STATUS_META[view.appointment.status].label}
                {view.appointment.cancellationReason
                  ? ` — ${view.appointment.cancellationReason}`
                  : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <footer className="mt-8 border-t border-black/30 pt-3 text-[0.6875rem] text-black/60">
        VELA Salon · 842 Valencia Street · in ngày {formatMediumDate(date)}
      </footer>
    </div>
  );
}
