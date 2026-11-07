"use client";
import * as React from "react";
import { initialSalonData } from "@/data";
import { useAuth } from "@/lib/auth-store";
import { scopedStaffId } from "@/lib/permissions";
import { appointmentViews, isDateKey } from "@/lib/salon";
import { TODAY, addDays, weekdayKey, formatLongDate } from "@/lib/clock";
import { AdminPage } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { STATUS_META } from "@/components/ui/badge";
import { AdminSelect } from "./form-kit";
import { AppointmentDrawer } from "./appointment-drawer";
import { NewBookingButton } from "./booking-drawer";
import { DaySheet } from "./day-sheet";
import {
  appointmentService,
  staffService,
  userService,
  couponService,
} from "@/services";
import {
  Search,
  Pagination,
  isAppointmentPaid,
  AppointmentRows,
} from "./workspace";

export function AppointmentsWorkspace({ initialDate, calendar = false }) {
  const { session } = useAuth();
  const mine = scopedStaffId(session);
  const [tab, setTab] = React.useState("active");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [date, setDate] = React.useState(
    initialDate && isDateKey(initialDate) ? initialDate : calendar ? TODAY : "",
  );
  const [staffId, setStaffId] = React.useState(mine ?? "all");
  const [status, setStatus] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(null);

  const [appointments, setAppointments] = React.useState([]);
  const [staffList, setStaffList] = React.useState([]);
  const [customersList, setCustomersList] = React.useState([]);
  const [couponsList, setCouponsList] = React.useState([]);

  React.useEffect(() => {
    setPage(1);
  }, [tab, date, staffId, status, search]);

  const refreshData = React.useCallback(() => {
    Promise.all([
      appointmentService.getAll().catch(() => []),
      staffService.getAll().catch(() => []),
      userService.getAll().catch(() => []),
      couponService.getAll().catch(() => []),
    ]).then(([appts, st, users, cpns]) => {
      if (Array.isArray(appts)) setAppointments(appts);
      if (Array.isArray(st)) setStaffList(st);
      if (Array.isArray(users)) {
        setCustomersList(
          users.map((u) => ({
            id: String(u.id),
            name: u.fullName || u.username || "Khách hàng",
            phone: u.phone || "",
            email: u.email || "",
          }))
        );
      }
      if (Array.isArray(cpns)) setCouponsList(cpns);
    });
  }, []);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const salonData = React.useMemo(() => ({
    ...initialSalonData,
    customers: customersList,
    staff: staffList,
    coupons: couponsList,
    timeOff: [],
    appointments,
  }), [customersList, staffList, couponsList, appointments]);

  const isItemActive = (v) => {
    const s = (v.appointment.status || "").toUpperCase();
    if (["PENDING", "IN_SERVICE", "CHECKED_IN", "CONFIRMED"].includes(s)) return true;
    if (s === "COMPLETED" && !isAppointmentPaid(v.appointment)) return true;
    return false;
  };

  const isItemArchived = (v) => {
    const s = (v.appointment.status || "").toUpperCase();
    if (["CANCELLED", "NO_SHOW"].includes(s)) return true;
    if (s === "COMPLETED" && isAppointmentPaid(v.appointment)) return true;
    return false;
  };

  const allFilteredViews = appointmentViews(salonData).filter(
    (v) =>
      (!mine || v.artist.id === mine) &&
      (!date || v.date === date) &&
      (staffId === "all" || v.artist.id === staffId) &&
      (status === "all" || v.appointment.status === status) &&
      [
        ` ${v.customer.name} ${v.customer.phone} ${v.appointment.bookingCode} ${v.serviceLabel}`,
      ]
        .join("")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const activeCount = allFilteredViews.filter(isItemActive).length;

  const pendingCount = allFilteredViews.filter(
    (v) => (v.appointment.status || "").toUpperCase() === "PENDING"
  ).length;

  const unpaidCount = allFilteredViews.filter(
    (v) =>
      (v.appointment.status || "").toUpperCase() === "COMPLETED" &&
      !isAppointmentPaid(v.appointment)
  ).length;

  const archivedCount = allFilteredViews.filter(isItemArchived).length;

  const tabFilteredRows = calendar
    ? allFilteredViews
    : allFilteredViews.filter((v) => {
        if (tab === "active") return isItemActive(v);
        if (tab === "archived") return isItemArchived(v);
        return true;
      });

  const getPriorityRank = (v) => {
    const s = (v.appointment.status || "").toUpperCase();
    if (s === "PENDING") return 1;
    if (s === "COMPLETED" && !isAppointmentPaid(v.appointment)) return 2;
    if (s === "IN_SERVICE" || s === "CHECKED_IN") return 3;
    if (s === "CONFIRMED") return 4;
    if (s === "COMPLETED" && isAppointmentPaid(v.appointment)) return 5;
    if (s === "CANCELLED" || s === "NO_SHOW") return 6;
    return 99;
  };

  const sortedRows = [...tabFilteredRows].sort((a, b) => {
    const rankA = getPriorityRank(a);
    const rankB = getPriorityRank(b);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    const stampA = `${a.date || ""} ${a.startTime || ""}`;
    const stampB = `${b.date || ""} ${b.startTime || ""}`;

    if (tab === "archived") {
      return stampB.localeCompare(stampA);
    }
    return stampA.localeCompare(stampB);
  });

  const paginatedRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const hours = salonData.businessHours.find(
    (hour) => hour.day === weekdayKey(date || TODAY),
  );
  const members = salonData.staff.filter(
    (member) =>
      (!mine || member.id === mine) &&
      (staffId === "all" || member.id === staffId),
  );
  return (
    <>
      <AdminPage
        className="print:hidden"
        eyebrow="VELA · Lịch hẹn"
        title={calendar ? "Lịch làm việc" : "Lịch hẹn"}
        description={
          calendar
            ? "Xem lịch theo ngày, lọc nhân viên và mở từng lịch hẹn để xử lý."
            : "Tra cứu và cập nhật lịch hẹn trên cùng dữ liệu với khách hàng và calendar."
        }
        actions={<NewBookingButton />}
      >
        {!calendar && (
          <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-paper/10 pb-px">
            <button
              type="button"
              onClick={() => setTab("active")}
              className={`relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === "active"
                  ? "border-champagne text-champagne"
                  : "border-transparent text-paper/60 hover:text-paper"
              }`}
            >
              <span>Cần xử lý & Đang diễn ra</span>
              <span className="rounded-full bg-paper/10 px-2 py-0.5 text-xs text-paper/80">
                {activeCount}
              </span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-champagne/20 px-2 py-0.5 text-[11px] font-semibold text-champagne animate-pulse">
                  {pendingCount} chờ duyệt
                </span>
              )}
              {unpaidCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[11px] font-semibold text-amber-400 animate-pulse">
                  {unpaidCount} chờ thanh toán
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setTab("archived")}
              className={`relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === "archived"
                  ? "border-champagne text-champagne"
                  : "border-transparent text-paper/60 hover:text-paper"
              }`}
            >
              <span>Đã hoàn thành & Đã hủy</span>
              <span className="rounded-full bg-paper/10 px-2 py-0.5 text-xs text-paper/80">
                {archivedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab("all")}
              className={`relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === "all"
                  ? "border-champagne text-champagne"
                  : "border-transparent text-paper/60 hover:text-paper"
              }`}
            >
              <span>Tất cả lịch hẹn</span>
              <span className="rounded-full bg-paper/10 px-2 py-0.5 text-xs text-paper/80">
                {allFilteredViews.length}
              </span>
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-end gap-4">
          <Search
            value={search}
            onChange={setSearch}
            placeholder="Tên khách, điện thoại, mã lịch hẹn…"
          />
          <Field label="Ngày">
            <Input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value || (calendar ? TODAY : ""))
              }
            />
          </Field>
          {mine ? null : (
            <Field label="Nhân viên">
              <AdminSelect
                value={staffId}
                onChange={(event) => setStaffId(event.target.value)}
              >
                <option value="all">Tất cả nhân viên</option>
                {staffList.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {!member.active ? " · Ngừng hoạt động" : ""}
                  </option>
                ))}
              </AdminSelect>
            </Field>
          )}
          <Field label="Trạng thái">
            <AdminSelect
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </AdminSelect>
          </Field>
          <Button
            variant="ghostLight"
            onClick={() => {
              setDate(calendar ? TODAY : "");
              setStaffId(mine ?? "all");
              setStatus("all");
              setSearch("");
              setTab("active");
            }}
          >
            Đặt lại bộ lọc
          </Button>
        </div>
        {calendar && (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outlineLight"
                  onClick={() => setDate(addDays(date, -1))}
                  aria-label="Ngày trước"
                >
                  ←
                </Button>
                <Button variant="outlineLight" onClick={() => setDate(TODAY)}>
                  Hôm nay
                </Button>
                <Button
                  variant="outlineLight"
                  onClick={() => setDate(addDays(date, 1))}
                  aria-label="Ngày sau"
                >
                  →
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outlineLight" onClick={() => window.print()}>
                  In phiếu ngày
                </Button>
              </div>
            </div>
            <p className="mb-4 text-sm text-paper/50">
              {formatLongDate(date)} · {sortedRows.length} lịch hẹn
              {!hours?.open ? " · Salon nghỉ" : ""}
            </p>
          </>
        )}
        <AppointmentRows rows={paginatedRows} onSelect={setSelected} />
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={sortedRows.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          itemLabel="lịch hẹn"
        />
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
          {Object.values(STATUS_META).map((meta) => (
            <span
              key={meta.label}
              className="flex items-center gap-2 text-xs text-paper/50"
            >
              <span className={`size-1.5 ${meta.dot}`} />
              {meta.label}
            </span>
          ))}
        </div>
        <AppointmentDrawer
          view={selected}
          onClose={() => setSelected(null)}
          onRefresh={refreshData}
        />
      </AdminPage>
      {calendar && (
        <DaySheet
          date={date || TODAY}
          rows={sortedRows}
          staff={members}
          hours={hours}
        />
      )}
    </>
  );
}
