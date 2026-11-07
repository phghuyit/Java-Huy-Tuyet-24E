const DAY_NAMES = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];

const MONTH_NAMES = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export function parseDate(value) {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  const [datePart, timePart] = String(value).split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh = 0, mm = 0] = (timePart ?? "").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export function toDateKey(date) {
  const d = date instanceof Date ? date : parseDate(date);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDate(value) {
  const d = parseDate(value);
  const day = `${d.getDate()}`.padStart(2, "0");
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const y = d.getFullYear();
  return `${day}/${m}/${y}`;
}

export function formatMediumDate(value) {
  const d = parseDate(value);
  return `${d.getDate()} thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
}

export function formatLongDate(value) {
  const d = parseDate(value);
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

export function durationLabel(min, max) {
  if (typeof max === "number" && max > min) {
    return `${min}–${max} phút`;
  }
  if (!min) return "30 phút";
  if (min < 60) return `${min} phút`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  if (!rem) return `${h} giờ`;
  return `${h} giờ ${rem} phút`;
}

export function formatTime12(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

export function formatTime24(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5);
}

const dateUtils = {
  parseDate,
  toDateKey,
  formatDate,
  formatMediumDate,
  formatLongDate,
  durationLabel,
  formatTime12,
};

export default dateUtils;
