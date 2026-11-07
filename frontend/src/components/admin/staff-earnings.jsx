"use client";
import * as React from "react";
import { currency } from "@/lib/format";
import { useAuth } from "@/lib/auth-store";
import { isOwner, scopedStaffId } from "@/lib/permissions";
import { staffPerformance } from "@/lib/reports";
import { initialSalonData } from "@/data";
import { appointmentService } from "@/services";
import { Panel } from "./layout-kit";
import { AdminSelect } from "./form-kit";
export function StaffEarnings({ member }) {
  const { session } = useAuth();
  const [range, setRange] = React.useState(30);
  const [appointments, setAppointments] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    appointmentService.getAll()
      .then((res) => {
        if (mounted && Array.isArray(res)) setAppointments(res);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const mine = scopedStaffId(session);
  const allowed = isOwner(session) || mine === member?.id;
  if (!allowed || !member) return null;

  const data = {
    ...initialSalonData,
    appointments,
  };

  const line = staffPerformance(data, range).find(
    (row) => row.id === member.id,
  );
  if (!line) return null;
  return (
    <Panel
      title={mine === member.id ? "Số liệu của bạn" : "Số liệu"}
      action={
        <AdminSelect
          aria-label="Khoảng thời gian"
          value={String(range)}
          onChange={(event) => setRange(Number(event.target.value))}
          className="h-8 py-0 text-xs"
        >
          <option value="30">30 ngày</option>
          <option value="90">90 ngày</option>
        </AdminSelect>
      }
    >
      <p className="font-display text-4xl tabular text-champagne">
        {currency(line.revenue)}
      </p>
      <p className="mt-3 text-xs text-paper/45">
        Tiền đã thu từ {line.completed} lượt hoàn thành
      </p>

      <dl className="mt-5 space-y-2 border-t border-paper/10 pt-4 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-paper/40">Trung bình mỗi lượt</dt>
          <dd className="tabular">
            {currency(
              line.completed ? Math.round(line.revenue / line.completed) : 0,
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-paper/40">Hủy & không đến</dt>
          <dd className="tabular">{line.lost}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-paper/40">Tỉ lệ hoàn thành</dt>
          <dd className="tabular">{line.completionRate.toFixed(1)}%</dd>
        </div>
      </dl>

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-paper/35">
        Chỉ tính khoản đã thu thật. Lịch xong nhưng chưa thu tiền chưa vào đây.
      </p>
    </Panel>
  );
}
