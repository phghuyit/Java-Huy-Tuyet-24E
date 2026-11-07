import { NOW_TIME, TODAY, addDays, formatLongDate, formatMediumDate, weekdayKey } from "./clock";
import { appointmentViews, awaitingReview } from "./salon";
import { amountDue } from "./payments";
import { waitlistOpenings, windowLabel } from "./waitlist";
export const NOTICE_META = {
    "confirm-pending": { label: "Chờ salon xác nhận", tone: "warn" },
    reminder: { label: "Nhắc lịch sắp tới", tone: "info" },
    "waitlist-opening": { label: "Có chỗ trống", tone: "stop" },
    "review-invite": { label: "Mời đánh giá", tone: "info" },
    "unpaid-followup": { label: "Nhắc thanh toán", tone: "warn" },
};
export const CHANNEL_LABEL = {
    sms: "SMS / Zalo",
    email: "Email",
};
const contact = (customer) => ({
    to: customer.name,
    phone: customer.phone,
    email: customer.email,
});
const slot = (date, startTime) => `${formatMediumDate(date)} lúc ${startTime}`;
function nextOpenDay(data) {
    for (let offset = 1; offset <= 7; offset += 1) {
        const date = addDays(TODAY, offset);
        const hours = data.businessHours.find(entry => entry.day === weekdayKey(date));
        if (hours?.open && hours.close)
            return date;
    }
    return null;
}
export function outbox(data) {
    const notices = [];
    const views = appointmentViews(data);
    const remindFor = nextOpenDay(data);
    for (const view of views) {
        const { appointment, customer } = view;
        if (appointment.status === "PENDING" && view.date >= TODAY) {
            notices.push({
                id: `ntc-pending-${appointment.id}`,
                kind: "confirm-pending",
                channel: "sms",
                ...contact(customer),
                subject: `Đã nhận yêu cầu ${appointment.bookingCode}`,
                body: `VELA đã nhận yêu cầu đặt lịch ${appointment.bookingCode} — ` +
                    `${view.serviceLabel}, ${slot(view.date, view.startTime)} với ${view.artist.name}. ` +
                    `Salon sẽ xác nhận lại với bạn trong ít phút.`,
                reason: "Lịch đang ở trạng thái Chờ xác nhận",
                appointmentId: appointment.id,
            });
            continue;
        }
        if (appointment.status === "CONFIRMED" && view.date === remindFor) {
            notices.push({
                id: `ntc-remind-${appointment.id}`,
                kind: "reminder",
                channel: "sms",
                ...contact(customer),
                subject: `Nhắc lịch ${formatMediumDate(view.date)}`,
                body: `Chào ${customer.name}, VELA nhắc bạn có hẹn ${view.serviceLabel} ` +
                    `vào ${slot(view.date, view.startTime)} với ${view.artist.name}. ` +
                    `Nếu cần đổi giờ, bạn trả lời tin này hoặc gọi salon giúp nhé.`,
                reason: `Lịch đã xác nhận cho buổi mở cửa kế tiếp (${formatLongDate(view.date)})`,
                appointmentId: appointment.id,
            });
            continue;
        }
        if (appointment.status === "COMPLETED" && !appointment.payment && view.date < TODAY) {
            notices.push({
                id: `ntc-unpaid-${appointment.id}`,
                kind: "unpaid-followup",
                channel: "sms",
                ...contact(customer),
                subject: `Khoản chưa thanh toán ${appointment.bookingCode}`,
                body: `Chào ${customer.name}, VELA ghi nhận buổi ${view.serviceLabel} ` +
                    `ngày ${formatMediumDate(view.date)} còn khoản ${amountDue(appointment).toLocaleString("vi-VN")} ₫ ` +
                    `chưa thanh toán. Bạn thu xếp giúp salon nhé, cảm ơn bạn.`,
                reason: "Đã hoàn thành nhưng chưa ghi nhận thanh toán",
                appointmentId: appointment.id,
            });
        }
    }
    for (const row of waitlistOpenings(data)) {
        const { entry, openings } = row;
        const service = data.services.find(item => item.id === entry.serviceId);
        notices.push({
            id: `ntc-wait-${entry.id}`,
            kind: "waitlist-opening",
            channel: "sms",
            to: entry.name,
            phone: entry.phone,
            email: entry.email,
            subject: `Đã có chỗ ngày ${formatMediumDate(entry.date)}`,
            body: `Chào ${entry.name}, VELA vừa có chỗ trống cho ${service?.name ?? "dịch vụ bạn chờ"} ` +
                `ngày ${formatMediumDate(entry.date)} — các giờ còn trống: ` +
                `${openings.slice(0, 4).map(item => item.time).join(", ")}. ` +
                `Bạn nhắn lại giờ phù hợp để salon giữ chỗ giúp bạn nhé.`,
            reason: `Đang chờ ${windowLabel(entry)} · ${openings.length} giờ vừa trống`,
            appointmentId: null,
        });
    }
    for (const customer of data.customers) {
        for (const visit of awaitingReview(data, customer.id).slice(0, 1)) {
            if (visit.appointmentDate < addDays(TODAY, -7))
                continue;
            const view = views.find(item => item.appointment.id === visit.id);
            if (!view)
                continue;
            notices.push({
                id: `ntc-review-${visit.id}`,
                kind: "review-invite",
                channel: "email",
                ...contact(customer),
                subject: "Buổi hẹn vừa rồi thế nào?",
                body: `Chào ${customer.name}, cảm ơn bạn đã tới VELA hôm ${formatMediumDate(view.date)}. ` +
                    `Nếu có một phút, bạn đánh giá giúp salon buổi ${view.serviceLabel} với ${view.artist.name} nhé — ` +
                    `vào mục Tài khoản trên website là được.`,
                reason: "Đã hoàn thành trong 7 ngày qua, khách chưa đánh giá",
                appointmentId: visit.id,
            });
        }
    }
    const weight = {
        "waitlist-opening": 0,
        "confirm-pending": 1,
        reminder: 2,
        "unpaid-followup": 3,
        "review-invite": 4,
    };
    return notices.sort((a, b) => weight[a.kind] - weight[b.kind] || a.to.localeCompare(b.to, "vi"));
}
export function outboxSummary(notices) {
    const counts = {};
    for (const notice of notices)
        counts[notice.kind] = (counts[notice.kind] ?? 0) + 1;
    return counts;
}
export const QUEUE_AT = `${TODAY}T${NOW_TIME}`;
