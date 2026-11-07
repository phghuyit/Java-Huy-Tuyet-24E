"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { TODAY, addDays, formatMediumDate } from "@/lib/clock";
import { compactCurrency, currency } from "@/lib/format";
import {
  clientMix,
  compareWindows,
  peakTimes,
  revenueByDay,
  staffPerformance,
  topServices,
} from "@/lib/reports";
import { initialSalonData } from "@/data";
import { appointmentService, staffService } from "@/services";
import { AdminPage, Panel } from "./layout-kit";
import { DayBars, Heatmap, RankedBars, SplitBar } from "./charts";
function formatDayMonth(date) {
  return `${date.slice(8)}/${date.slice(5, 7)}`;
}
function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}
const RANGES = [
  { value: 30, label: "30 ngày" },
  { value: 90, label: "90 ngày" },
];
const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export function ReportsWorkspace() {
  const [range, setRange] = React.useState(30);
  const [appointments, setAppointments] = React.useState([]);
  const [staffList, setStaffList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      appointmentService.getAll().catch(() => []),
      staffService.getAll().catch(() => []),
    ]).then(([appts, st]) => {
      if (!mounted) return;
      if (Array.isArray(appts)) setAppointments(appts);
      if (Array.isArray(st)) setStaffList(st);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const data = React.useMemo(() => ({
    ...initialSalonData,
    staff: staffList.length > 0 ? staffList : initialSalonData.staff,
    appointments,
  }), [staffList, appointments]);

  const report = React.useMemo(() => {
    return {
      comparison: compareWindows(data, range),
      daily: revenueByDay(data, range),
      services: topServices(data, range),
      staff: staffPerformance(data, range),
      peak: peakTimes(data, range),
      mix: clientMix(data, range),
    };
  }, [data, range]);
  if (!report) {
    return (
      <AdminPage eyebrow="VELA · Báo cáo" title="Báo cáo">
        <p role="status" className="text-paper/50">
          Đang tổng hợp số liệu…
        </p>
      </AdminPage>
    );
  }
  const { comparison, daily, services, staff, peak, mix } = report;
  const { current, previous, revenueDelta } = comparison;
  const from = addDays(TODAY, -(range - 1));
  const series =
    range === 30
      ? daily.map((day) => ({
          label: formatDayMonth(day.date),
          value: day.revenue,
          display: currency(day.revenue),
          caption: `${formatMediumDate(day.date)} · ${day.completed} lượt`,
        }))
      : chunk(daily, 7).map((week) => {
          const revenue = week.reduce((sum, day) => sum + day.revenue, 0);
          const completed = week.reduce((sum, day) => sum + day.completed, 0);
          return {
            label: formatDayMonth(week[0].date),
            value: revenue,
            display: currency(revenue),
            caption: `${formatMediumDate(week[0].date)} – ${formatMediumDate(week[week.length - 1].date)} · ${completed} lượt`,
          };
        });
  return (
    <AdminPage
      eyebrow="VELA · Báo cáo"
      title="Báo cáo"
      description={`${formatMediumDate(from)} — ${formatMediumDate(TODAY)} · chỉ tính lịch hẹn đã hoàn thành`}
      actions={
        <div className="flex border border-paper/12">
          {RANGES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRange(item.value)}
              aria-pressed={range === item.value}
              className={cn(
                "px-4 py-2 text-[0.75rem] transition-colors",
                range === item.value
                  ? "bg-champagne text-void"
                  : "text-paper/50 hover:text-paper",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-2 border-y border-paper/10 xl:grid-cols-5">
        <Figure
          label="Đã thu"
          value={currency(current.revenue)}
          delta={revenueDelta}
          hint={
            previous.booked
              ? `kỳ trước ${currency(previous.revenue)}`
              : "chưa đủ dữ liệu kỳ trước để so sánh"
          }
        />
        <Figure
          label="Chưa thu"
          value={currency(current.outstanding)}
          hint={
            current.outstanding
              ? "đã làm xong nhưng chưa nhận tiền"
              : "đã thu đủ"
          }
          bordered
        />
        <Figure
          label="Lịch hoàn thành"
          value={String(current.completed)}
          hint={`trên ${current.booked} lịch đã đặt`}
          bordered
        />
        <Figure
          label="Giá trị trung bình"
          value={currency(current.averageTicket)}
          hint="mỗi lượt hoàn thành"
          className="border-t border-paper/10 xl:border-t-0"
          bordered
        />
        <Figure
          label="Tỉ lệ hủy & vắng"
          value={`${current.lossRate.toFixed(1)}%`}
          hint={`${current.cancelled} hủy · ${current.noShow} không đến`}
          className="border-t border-paper/10 xl:border-t-0"
          bordered
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Panel
            title={range === 30 ? "Doanh thu theo ngày" : "Doanh thu theo tuần"}
          >
            <DayBars
              height={220}
              data={series}
              axisLabel={compactCurrency}
              averageLabel={compactCurrency}
            />
            <p className="mt-5 text-[0.75rem] leading-relaxed text-paper/35">
              {range === 30
                ? "Mỗi cột là một ngày; cột trống là ngày salon nghỉ."
                : "Mỗi cột là một tuần, gộp lại cho dễ đọc hơn 90 cột rời."}{" "}
              Đường nét đứt là mức trung bình của các{" "}
              {range === 30 ? "ngày" : "tuần"} có doanh thu.
            </p>
          </Panel>

          <Panel title="Khung giờ đông khách">
            <Heatmap
              rows={peak.rows}
              rowLabels={DAY_LABELS}
              colLabels={peak.hours.map((hour) =>
                String(hour).padStart(2, "0"),
              )}
              max={peak.max}
            />
            <p className="mt-5 text-[0.75rem] leading-relaxed text-paper/35">
              Ô càng đậm càng nhiều lịch hẹn. Dùng để xếp ca — ô viền sáng là
              khung giờ gần kín.
            </p>
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Panel title="Dịch vụ theo doanh thu">
            {services.length ? (
              <RankedBars
                rows={services.map((service) => ({
                  label: service.name,
                  value: currency(service.revenue),
                  caption: `${service.bookings} lượt`,
                  share: service.share,
                }))}
              />
            ) : (
              <Empty />
            )}
          </Panel>

          <Panel title="Khách quay lại">
            <SplitBar
              segments={[
                { label: "Khách quay lại", value: mix.returning },
                { label: "Khách mới", value: mix.fresh, muted: true },
              ]}
            />
            <p className="mt-5 text-[0.75rem] leading-relaxed text-paper/35">
              Tính trên {mix.total} khách có lịch hoàn thành trong kỳ. Khách mới
              là người có lần hẹn đầu tiên nằm trong kỳ này.
            </p>
          </Panel>
        </div>
      </div>

      <Panel
        className="mt-6"
        title="Hiệu suất nhân viên"
        dense
        bodyClassName="px-5 py-2"
      >
        <ul>
          {staff.map((member) => {
            const portrait = staffList.find(
              (item) => item.id === member.id,
            )?.portrait;
            return (
              <li
                key={member.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-paper/[0.07] py-4 last:border-b-0 md:grid-cols-[auto_1.4fr_7rem_7rem_7rem]"
              >
                <span className="relative size-9 shrink-0 overflow-hidden bg-paper/10">
                  {portrait ? (
                    <Image
                      src={portrait}
                      alt=""
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  ) : null}
                </span>

                <Link
                  href={`/admin/staff/${staffList.find((item) => item.id === member.id)?.slug ?? ""}`}
                  className="min-w-0 truncate text-[0.9375rem] transition-colors hover:text-champagne"
                >
                  {member.name}
                </Link>

                <Cell label="Doanh thu" value={currency(member.revenue)} />
                <Cell label="Hoàn thành" value={`${member.completed} lượt`} />
                <Cell
                  label="Tỉ lệ hoàn thành"
                  value={`${member.completionRate.toFixed(0)}%`}
                  muted={member.completionRate < 90}
                />
              </li>
            );
          })}
        </ul>
      </Panel>

      <p className="mt-8 border-t border-paper/10 pt-5 text-[0.75rem] leading-relaxed text-paper/30">
        Số liệu tính trực tiếp từ bảng lịch hẹn. Doanh thu chỉ cộng các lịch ở
        trạng thái “Hoàn thành”, nên hủy một lịch trong phần quản trị là báo cáo
        đổi theo ngay.
      </p>
    </AdminPage>
  );
}
function Figure({ label, value, hint, delta, bordered, className }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        "px-5 py-7 md:px-7",
        bordered && "border-l border-paper/10",
        className,
      )}
    >
      <p className="eyebrow text-paper/35">{label}</p>
      <p className="mt-4 break-words font-display text-[2rem] leading-none tabular text-champagne md:text-[2.5rem]">
        {value}
      </p>
      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem]">
        {delta !== undefined && delta !== null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 tabular",
              up ? "text-signal-live" : "text-signal-stop",
            )}
          >
            {up ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {up ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        ) : null}
        {hint ? <span className="text-paper/30">{hint}</span> : null}
      </p>
    </div>
  );
}
function Cell({ label, value, muted }) {
  return (
    <span className="hidden md:block">
      <span className="block text-[0.625rem] uppercase tracking-[0.14em] text-paper/25">
        {label}
      </span>
      <span
        className={cn(
          "mt-1.5 block text-[0.875rem] tabular",
          muted ? "text-signal-warn" : "text-paper/75",
        )}
      >
        {value}
      </span>
    </span>
  );
}
function Empty() {
  return (
    <p className="py-6 text-center text-[0.8125rem] text-paper/30">
      Chưa có lịch hẹn hoàn thành trong kỳ này.
    </p>
  );
}
