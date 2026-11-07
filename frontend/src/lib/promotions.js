import { TODAY } from "./clock";
export function netPrice(appointment) {
    if (!appointment) return 0;
    if (appointment.totalAmount != null && !isNaN(Number(appointment.totalAmount))) {
        return Number(appointment.totalAmount);
    }
    const price = Number(appointment.price ?? appointment.subTotal ?? appointment.totalPrice ?? 0);
    const discount = Number(appointment.discount ?? appointment.discountAmount ?? 0);
    return Math.max(price - discount, 0);
}
export function findPromotion(data, code) {
    const wanted = code.trim().toUpperCase();
    if (!wanted)
        return null;
    return data.promotions.find(item => item.code.toUpperCase() === wanted) ?? null;
}
export function isRunning(promotion, date = TODAY) {
    return promotion.active && date >= promotion.startDate && date <= promotion.endDate;
}
export function coversService(promotion, service) {
    if (promotion.serviceIds.length && promotion.serviceIds.includes(service.id))
        return true;
    if (promotion.categorySlugs.length && promotion.categorySlugs.includes(service.categorySlug))
        return true;
    return false;
}
export function discountFor(promotion, services) {
    const covered = services.filter(service => coversService(promotion, service));
    if (!covered.length)
        return 0;
    const subtotal = covered.reduce((sum, service) => sum + service.price, 0);
    const raw = promotion.discount;
    return Math.min(Math.round(raw), subtotal);
}
export function checkPromotion(data, code, services, date) {
    if (!services.length)
        return { ok: false, message: "Hãy chọn dịch vụ trước." };
    const promotion = findPromotion(data, code);
    if (!promotion)
        return { ok: false, message: "Mã không tồn tại." };
    if (!promotion.active)
        return { ok: false, message: "Mã này đã ngừng áp dụng." };
    if (date < promotion.startDate) {
        return { ok: false, message: `Mã có hiệu lực từ ${promotion.startDate.split("-").reverse().join("/")}.` };
    }
    if (date > promotion.endDate)
        return { ok: false, message: "Mã đã hết hạn." };
    if (!services.some(service => coversService(promotion, service))) {
        return {
            ok: false,
            message: `Mã không áp dụng cho ${services.map(item => item.name).join(", ")}.`,
        };
    }
    const discount = discountFor(promotion, services);
    if (discount <= 0)
        return { ok: false, message: "Mã không giảm được cho dịch vụ này." };
    return { ok: true, promotion, discount };
}
export function redemptionsOf(data, promotion) {
    const code = promotion.code.toUpperCase();
    const used = data.appointments.filter(item => item.promotionCode.toUpperCase() === code && item.status !== "CANCELLED");
    return {
        count: promotion.redemptions + used.length,
        given: used.reduce((sum, item) => sum + item.discount, 0),
    };
}
export function runningPromotions(data, services = [], date = TODAY) {
    return data.promotions.filter(item => isRunning(item, date)
        && (!services.length || services.some(service => coversService(item, service))));
}
