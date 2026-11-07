function getSystemDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getSystemTimeKey() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export const TODAY = getSystemDateKey();
export const NOW_TIME = getSystemTimeKey();
export const WEEKDAY_KEYS = [
    "sun",
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
];
const DAY_NAMES = [
    "Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy",
];
const MONTH_NAMES = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
export function parseDate(value) {
    const [datePart, timePart] = value.split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    const [hh = 0, mm = 0] = (timePart ?? "").split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0);
}
export function toDateKey(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${d}`;
}
export function addDays(value, days) {
    const date = parseDate(value);
    date.setDate(date.getDate() + days);
    return toDateKey(date);
}
export function weekdayKey(value) {
    return WEEKDAY_KEYS[parseDate(value).getDay()];
}
export function dayName(value) {
    return DAY_NAMES[parseDate(value).getDay()];
}
export function monthName(value) {
    return MONTH_NAMES[parseDate(value).getMonth()];
}
export function formatDayMonth(value) {
    return formatMediumDate(value);
}
export function formatShortDate(value) {
    return formatMediumDate(value);
}
export function formatMediumDate(value) {
    const date = parseDate(value);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}
export function formatLongDate(value) {
    const date = parseDate(value);
    return `${DAY_NAMES[date.getDay()]}, ${formatMediumDate(value)}`;
}
export function formatTime12(time) {
    return time;
}
export function toMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}
export function fromMinutes(total) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${`${h}`.padStart(2, "0")}:${`${m}`.padStart(2, "0")}`;
}
export function splitStamp(stamp) {
    const [date, time = "00:00"] = stamp.split("T");
    return { date, time };
}
export function durationLabel(min, max) {
    if (max && max !== min)
        return `${min}–${max} phút`;
    return `${min} phút`;
}
export function daysBetween(a, b) {
    const ms = parseDate(b).getTime() - parseDate(a).getTime();
    return Math.round(ms / 86_400_000);
}
export function startOfWeek(value, weekStartsOn = 1) {
    const date = parseDate(value);
    const diff = (date.getDay() - weekStartsOn + 7) % 7;
    date.setDate(date.getDate() - diff);
    return toDateKey(date);
}
export function relativeDayLabel(value, from = TODAY) {
    const delta = daysBetween(from, value);
    if (delta === 0)
        return "Hôm nay";
    if (delta === 1)
        return "Ngày mai";
    if (delta === -1)
        return "Hôm qua";
    return formatShortDate(value);
}
