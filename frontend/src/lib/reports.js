import { amountDue, amountPaid } from "./payments";
import { TODAY, addDays, daysBetween, toMinutes, weekdayKey } from "./clock";
const EARNED = "COMPLETED";
const LOST = ["CANCELLED", "NO_SHOW"];
function inWindow(data, days, endOffset = 0) {
    const end = addDays(TODAY, endOffset);
    const start = addDays(end, -(days - 1));
    return data.appointments.filter(item => item.appointmentDate >= start && item.appointmentDate <= end);
}
function totalsOf(rows) {
    const completed = rows.filter(item => item.status === EARNED);
    const cancelled = rows.filter(item => item.status === "CANCELLED");
    const noShow = rows.filter(item => item.status === "NO_SHOW");
    const revenue = completed.reduce((sum, item) => sum + amountPaid(item), 0);
    const outstanding = completed.reduce((sum, item) => sum + Math.max(amountDue(item) - amountPaid(item), 0), 0);
    const settled = completed.length + cancelled.length + noShow.length;
    return {
        revenue,
        outstanding,
        completed: completed.length,
        booked: rows.length,
        cancelled: cancelled.length,
        noShow: noShow.length,
        averageTicket: completed.length ? Math.round(revenue / completed.length) : 0,
        lossRate: settled ? ((cancelled.length + noShow.length) / settled) * 100 : 0,
    };
}
export function compareWindows(data, days) {
    const current = totalsOf(inWindow(data, days));
    const previous = totalsOf(inWindow(data, days, -days));
    return {
        current,
        previous,
        revenueDelta: previous.revenue
            ? ((current.revenue - previous.revenue) / previous.revenue) * 100
            : null,
    };
}
export function revenueByDay(data, days) {
    const rows = inWindow(data, days).filter(item => item.status === EARNED);
    const buckets = new Map();
    for (let i = days - 1; i >= 0; i -= 1) {
        buckets.set(addDays(TODAY, -i), { revenue: 0, completed: 0 });
    }
    for (const item of rows) {
        const bucket = buckets.get(item.appointmentDate);
        if (!bucket)
            continue;
        bucket.revenue += amountPaid(item);
        bucket.completed += 1;
    }
    return [...buckets.entries()].map(([date, value]) => ({
        date,
        label: date.slice(8),
        ...value,
    }));
}
export function topServices(data, days, limit = 7) {
    const rows = inWindow(data, days).filter(item => item.status === EARNED);
    const totalRevenue = rows.reduce((sum, item) => sum + amountPaid(item), 0);
    const tally = new Map();
    for (const item of rows) {
        const lines = item.serviceIds
            .map(id => ({ id, price: data.services.find(service => service.id === id)?.price ?? 0 }));
        const listTotal = lines.reduce((sum, line) => sum + line.price, 0);
        const net = amountPaid(item);
        for (const line of lines) {
            const entry = tally.get(line.id) ?? { bookings: 0, revenue: 0 };
            entry.bookings += 1;
            entry.revenue += listTotal ? (net * line.price) / listTotal : net / lines.length;
            tally.set(line.id, entry);
        }
    }
    return [...tally.entries()]
        .map(([id, value]) => ({
        id,
        name: data.services.find(service => service.id === id)?.name ?? id,
        bookings: value.bookings,
        revenue: value.revenue,
        share: totalRevenue ? (value.revenue / totalRevenue) * 100 : 0,
    }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
}
export function staffPerformance(data, days) {
    const rows = inWindow(data, days);
    return data.staff
        .map(member => {
        const mine = rows.filter(item => item.staffId === member.id);
        const completed = mine.filter(item => item.status === EARNED);
        const lost = mine.filter(item => LOST.includes(item.status));
        const settled = completed.length + lost.length;
        return {
            id: member.id,
            name: member.name,
            completed: completed.length,
            revenue: completed.reduce((sum, item) => sum + amountPaid(item), 0),
            lost: lost.length,
            completionRate: settled ? (completed.length / settled) * 100 : 0,
        };
    })
        .sort((a, b) => b.revenue - a.revenue);
}
export function peakTimes(data, days) {
    const open = data.businessHours.filter(entry => entry.open && entry.close);
    const startHour = Math.min(...open.map(entry => Math.floor(toMinutes(entry.open) / 60)));
    const endHour = Math.max(...open.map(entry => Math.ceil(toMinutes(entry.close) / 60)));
    const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
    const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const rows = order.map(() => hours.map(() => 0));
    for (const item of inWindow(data, days)) {
        if (LOST.includes(item.status))
            continue;
        const dayIndex = order.indexOf(weekdayKey(item.appointmentDate));
        const hourIndex = Math.floor(toMinutes(item.startTime) / 60) - startHour;
        if (dayIndex < 0 || hourIndex < 0 || hourIndex >= hours.length)
            continue;
        rows[dayIndex][hourIndex] += 1;
    }
    return { startHour, hours, rows, max: Math.max(1, ...rows.flat()) };
}
export function clientMix(data, days) {
    const rows = inWindow(data, days).filter(item => item.status === EARNED);
    const seen = new Set();
    let fresh = 0;
    for (const customerId of new Set(rows.map(item => item.customerId))) {
        const first = data.appointments
            .filter(item => item.customerId === customerId && item.status === EARNED)
            .map(item => item.appointmentDate)
            .sort()[0];
        seen.add(customerId);
        if (first && daysBetween(first, TODAY) < days)
            fresh += 1;
    }
    return { returning: seen.size - fresh, fresh, total: seen.size };
}
