import { TODAY, addDays } from "@/lib/clock";
import { appointments } from "./appointments";
import { customers } from "./customers";
const LIVE = ["PENDING", "CONFIRMED"];
function build() {
    const rows = [];
    const used = new Set();
    const notes = [
        "Chỉ rảnh buổi sáng, nhờ salon gọi sớm giúp em.",
        "Có chỗ là em đi ngay, giờ nào cũng được trong khung này.",
        "Em đi cùng bạn, nếu trống hai chỗ càng tốt.",
    ];
    const shadowed = appointments
        .filter(item => item.appointmentDate > TODAY && LIVE.includes(item.status))
        .sort((a, b) => `${a.appointmentDate}${a.startTime}`.localeCompare(`${b.appointmentDate}${b.startTime}`))
        .slice(0, 3);
    shadowed.forEach((visit, index) => {
        const waiter = customers.find(item => item.id !== visit.customerId && !used.has(item.id));
        if (!waiter)
            return;
        used.add(waiter.id);
        rows.push({
            id: `wl-seed-${index + 1}`,
            customerId: waiter.passwordHash ? waiter.id : null,
            name: waiter.name,
            phone: waiter.phone,
            email: waiter.email,
            serviceId: visit.serviceIds[0],
            staffId: visit.staffId,
            date: visit.appointmentDate,
            fromTime: visit.startTime,
            toTime: visit.startTime,
            note: notes[index] ?? "",
            status: "WAITING",
            createdAt: `${TODAY}T08:30`,
            appointmentId: null,
        });
    });
    const open = customers.find(item => !used.has(item.id));
    if (open) {
        rows.push({
            id: `wl-seed-${rows.length + 1}`,
            customerId: open.passwordHash ? open.id : null,
            name: open.name,
            phone: open.phone,
            email: open.email,
            serviceId: appointments[0].serviceIds[0],
            staffId: "any",
            date: addDays(TODAY, 5),
            fromTime: null,
            toTime: null,
            note: "Ai trống cũng được ạ.",
            status: "WAITING",
            createdAt: `${TODAY}T09:10`,
            appointmentId: null,
        });
    }
    return rows;
}
export const waitlist = build();
