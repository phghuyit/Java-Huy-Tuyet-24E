import { TODAY, toMinutes } from "./clock";
import { activeServices, availableSlots } from "./salon";
export function openingsFor(data, entry) {
    if ((entry.status || "").toUpperCase() !== "WAITING" || (entry.date && entry.date < TODAY))
        return [];
    if (!entry.serviceId)
        return [];
    const service = activeServices(data).find(item => String(item.id) === String(entry.serviceId));
    if (!service)
        return [];
    const from = entry.fromTime ? toMinutes(entry.fromTime) : null;
    const to = entry.toTime ? toMinutes(entry.toTime) : null;
    return availableSlots(data, entry.date, entry.staffId, service.durationMin, [service.id])
        .filter(slot => {
        if (!slot.available)
            return false;
        const start = toMinutes(slot.time);
        if (from !== null && start < from)
            return false;
        if (to !== null && start > to)
            return false;
        return true;
    });
}
export function waitlistRows(data) {
    const list = Array.isArray(data.waitlist) ? data.waitlist : [];
    return list
        .filter(entry => (entry.status || "").toUpperCase() === "WAITING" && (!entry.date || entry.date >= TODAY))
        .map(entry => ({ entry, openings: openingsFor(data, entry) }))
        .sort((a, b) => Number(Boolean(b.openings.length)) - Number(Boolean(a.openings.length)) ||
        (a.entry.date || "").localeCompare(b.entry.date || "") ||
        (a.entry.createdAt || "").localeCompare(b.entry.createdAt || ""));
}
export function waitlistOpenings(data) {
    return waitlistRows(data).filter(row => row.openings.length > 0);
}
export function windowLabel(entry) {
    if (entry.fromTime && entry.toTime)
        return `${entry.fromTime}–${entry.toTime}`;
    if (entry.fromTime)
        return `từ ${entry.fromTime}`;
    if (entry.toTime)
        return `trước ${entry.toTime}`;
    return "bất kỳ giờ nào";
}
