"use client";
import * as React from "react";
import Link from "next/link";
import { initialSalonData } from "@/data";
import { useAuth } from "@/lib/auth-store";
import { can, scopedStaffId } from "@/lib/permissions";
import { appointmentViews } from "@/lib/salon";
import { TODAY, NOW_TIME, formatLongDate } from "@/lib/clock";
import { currency } from "@/lib/format";
import { netPrice } from "@/lib/promotions";
import { AdminPage, Panel } from "./layout-kit";
import { AppointmentDrawer } from "./appointment-drawer";
import { AttentionPanel } from "./attention-panel";
import { WaitlistAlert } from "./waitlist-workspace";
import { NewBookingButton } from "./booking-drawer";
import { appointmentService, staffService, userService, couponService } from "@/services";
import { linkClass, AppointmentRows } from "./workspace";

export function DashboardOverview() {
  const { session } = useAuth();
  const mine = scopedStaffId(session);
  const [appointments, setAppointments] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [coupons, setCoupons] = React.useState([]);

  const loadOverview = React.useCallback(() => {
    Promise.all([
      appointmentService.getAll().catch(() => []),
      userService.getAll().catch(() => []),
      staffService.getAll().catch(() => []),
      couponService.getAll().catch(() => []),
    ]).then(([appts, users, st, cpns]) => {
      if (Array.isArray(appts)) setAppointments(appts);
      if (Array.isArray(users)) {
        setCustomers(
          users.map((u) => ({
            id: String(u.id),
            name: u.fullName || u.username || "Khách hàng",
            phone: u.phone || "",
            email: u.email || "",
          }))
        );
      }
      if (Array.isArray(st)) setStaff(st);
      if (Array.isArray(cpns)) setCoupons(cpns);
    });
  }, []);

  React.useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const salonData = React.useMemo(() => ({
    ...initialSalonData,
    customers,
    staff,
    coupons,
    appointments,
  }), [customers, staff, coupons, appointments]);

  const views = appointmentViews(salonData).filter(
    (view) => !mine || view.artist.id === mine,
  );
  const today = views.filter((view) => view.date === TODAY);
  const [selected, setSelected] = React.useState(null);
  const metrics = [
    ["Lịch hẹn hôm nay", String(today.length)],
    [
      "Chờ xác nhận",
      String(today.filter((v) => v.appointment.status === "PENDING").length),
    ],
    [
      "Hoàn thành",
      String(today.filter((v) => v.appointment.status === "COMPLETED").length),
    ],
    [
      "Đã hủy",
      String(today.filter((v) => v.appointment.status === "CANCELLED").length),
    ],
    ...(can(session, "revenue")
      ? [
          [
            "Doanh thu dự kiến",
            currency(
              today
                .filter(
                  (v) =>
                    !["CANCELLED", "NO_SHOW"].includes(v.appointment.status),
                )
                .reduce((sum, v) => sum + netPrice(v.appointment), 0),
            ),
          ],
        ]
      : []),
  ];
  const upcoming = [...views]
    .filter(
      (v) =>
        v.date >= TODAY &&
        ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_SERVICE"].includes(
          (v.appointment.status || "").toUpperCase(),
        ) &&
        (v.date !== TODAY || v.endTime > NOW_TIME),
    )
    .sort((a, b) => {
      const rank = (status) => {
        const s = (status || "").toUpperCase();
        if (s === "PENDING") return 1;
        if (s === "IN_SERVICE" || s === "CHECKED_IN") return 2;
        if (s === "CONFIRMED") return 3;
        return 4;
      };
      const diff = rank(a.appointment.status) - rank(b.appointment.status);
      if (diff !== 0) return diff;
      return `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
    })
    .slice(0, 8);
  return (
    <AdminPage
      eyebrow="VELA · Hoạt động salon"
      title="Tổng quan"
      description={formatLongDate(TODAY)}
      actions={<NewBookingButton />}
    >
      <div className="mb-10 grid grid-cols-2 border-y border-paper/10 md:grid-cols-3 xl:grid-cols-5">
        {metrics.map(([label, value]) => (
          <dl
            key={label}
            className="border-b border-paper/10 px-4 py-6 xl:border-b-0"
          >
            <dt className="text-xs text-paper/50">{label}</dt>
            <dd className="mt-4 break-words font-display text-3xl tabular text-champagne">
              {value}
            </dd>
          </dl>
        ))}
      </div>
      <div className="mb-8 space-y-6">
        {can(session, "waitlist") && <WaitlistAlert />}
        <AttentionPanel onSelect={setSelected} />
      </div>
      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        <Panel
          title="Lịch hẹn sắp tới"
          action={
            <Link className={linkClass} href="/admin/calendar">
              Xem lịch làm việc
            </Link>
          }
          dense
        >
          <AppointmentRows rows={upcoming} onSelect={setSelected} />
        </Panel>
        <Panel title="Đang phục vụ">
          <AppointmentRows
            rows={today.filter((v) =>
              ["CHECKED_IN", "IN_SERVICE"].includes(v.appointment.status),
            )}
            onSelect={setSelected}
          />
        </Panel>
      </div>
      <AppointmentDrawer
        view={selected}
        onClose={() => setSelected(null)}
        onRefresh={loadOverview}
      />
    </AdminPage>
  );
}
