import { NOW_TIME, TODAY, daysBetween, toMinutes } from "./clock";
import { appointmentViews } from "./salon";
const WAITING_GRACE = 15;
const CONFIRM_HORIZON = 24 * 60;
const OPEN = ["PENDING", "CONFIRMED", "CHECKED_IN", "IN_SERVICE"];
export const ATTENTION_META = {
  stale: { label: "Chưa chốt", tone: "stop" },
  "overdue-confirm": { label: "Quá giờ chưa xác nhận", tone: "stop" },
  waiting: { label: "Khách đang chờ", tone: "warn" },
  overrunning: { label: "Quá giờ phục vụ", tone: "warn" },
  "confirm-soon": { label: "Chờ xác nhận", tone: "info" },
  unpaid: { label: "Chưa thu tiền", tone: "warn" },
};
const UNPAID_WINDOW = 7;
export function needsAttention(data, today = TODAY, now = NOW_TIME) {
  const nowMin = toMinutes(now);
  const items = [];
  for (const view of appointmentViews(data)) {
    const { appointment } = view;
    if (appointment.status === "COMPLETED") {
      const age = daysBetween(view.date, today);
      if (!appointment.payment && age >= 0 && age <= UNPAID_WINDOW) {
        items.push({ view, kind: "unpaid", overdueBy: age * 1440, weight: 2 });
      }
      continue;
    }
    if (!OPEN.includes(appointment.status)) continue;
    const untilStart =
      daysBetween(today, view.date) * 1440 + toMinutes(view.startTime) - nowMin;
    const untilEnd =
      daysBetween(today, view.date) * 1440 + toMinutes(view.endTime) - nowMin;
    if (view.date < today) {
      items.push({ view, kind: "stale", overdueBy: -untilStart, weight: 0 });
      continue;
    }
    if (appointment.status === "PENDING" && untilStart <= 0) {
      items.push({
        view,
        kind: "overdue-confirm",
        overdueBy: -untilStart,
        weight: 1,
      });
      continue;
    }
    if (appointment.status === "CHECKED_IN" && untilStart < -WAITING_GRACE) {
      items.push({ view, kind: "waiting", overdueBy: -untilStart, weight: 2 });
      continue;
    }
    if (appointment.status === "IN_SERVICE" && untilEnd < 0) {
      items.push({
        view,
        kind: "overrunning",
        overdueBy: -untilEnd,
        weight: 2,
      });
      continue;
    }
    if (appointment.status === "PENDING" && untilStart <= CONFIRM_HORIZON) {
      items.push({ view, kind: "confirm-soon", overdueBy: 0, weight: 3 });
    }
  }
  return items.sort(
    (a, b) =>
      a.weight - b.weight ||
      b.overdueBy - a.overdueBy ||
      a.view.appointment.appointmentDate.localeCompare(
        b.view.appointment.appointmentDate,
      ) ||
      a.view.startTime.localeCompare(b.view.startTime),
  );
}
export function durationSince(minutes) {
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} ngày`;
  }
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}
