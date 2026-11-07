import { netPrice } from "./promotions";
export const PAYMENT_LABEL = {
    cash: "Tiền mặt",
    transfer: "Chuyển khoản",
    card: "Quẹt thẻ",
};
export const amountDue = (appointment) => netPrice(appointment);
export const amountPaid = (appointment) => appointment.payment?.amount ?? 0;
export const outstanding = (appointment) => appointment.status === "COMPLETED" ? Math.max(amountDue(appointment) - amountPaid(appointment), 0) : 0;
export const awaitingPayment = (appointment) => appointment.status === "COMPLETED" && !appointment.payment;
