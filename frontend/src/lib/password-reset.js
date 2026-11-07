"use client";
const STORAGE_KEY = "vela-password-reset-v1";
export const RESET_MINUTES = 30;
function readAll() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const value = raw ? JSON.parse(raw) : [];
        return Array.isArray(value) ? value : [];
    }
    catch {
        return [];
    }
}
function writeAll(tickets) {
    try {
        const cutoff = Date.now() - RESET_MINUTES * 60_000;
        const kept = tickets.filter((ticket) => new Date(ticket.expiresAt).getTime() > cutoff);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    }
    catch {
    }
}
export function createResetTicket(scope, email, customToken, customExpiresAt) {
    const normalized = email.trim().toLowerCase();
    const tickets = readAll();
    const ticket = {
        token: customToken || crypto.randomUUID().replace(/-/g, ""),
        scope,
        email: normalized,
        expiresAt: customExpiresAt || new Date(Date.now() + RESET_MINUTES * 60_000).toISOString(),
    };
    writeAll([
        ...tickets.filter((item) => !(item.scope === scope && item.email === normalized)),
        ticket,
    ]);
    return ticket;
}
export function readResetTicket(token) {
    const ticket = readAll().find((item) => item.token === token);
    if (!ticket)
        return { error: "missing" };
    if (ticket.usedAt)
        return { error: "used" };
    if (new Date(ticket.expiresAt).getTime() <= Date.now()) {
        return { error: "expired" };
    }
    return { ticket };
}
export function consumeResetTicket(token) {
    const tickets = readAll();
    writeAll(tickets.map((item) => item.token === token ? { ...item, usedAt: new Date().toISOString() } : item));
}
const resolutions = new Map();
export function resolveTicket(token, scope) {
    const key = `${scope}:${token}`;
    const cached = resolutions.get(key);
    if (cached)
        return cached;
    const result = readResetTicket(token);
    const resolution = "error" in result
        ? { status: "invalid", message: TICKET_MESSAGE[result.error] }
        : result.ticket.scope !== scope
            ? { status: "invalid", message: TICKET_MESSAGE.missing }
            : { status: "ready", email: result.ticket.email };
    resolutions.set(key, resolution);
    return resolution;
}
export const subscribeToTicket = () => () => { };
export const TICKET_CHECKING = { status: "checking" };
export const TICKET_MESSAGE = {
    missing: "Liên kết đặt lại mật khẩu không hợp lệ.",
    expired: `Liên kết đã hết hạn sau ${RESET_MINUTES} phút. Vui lòng yêu cầu lại.`,
    used: "Liên kết này đã được sử dụng. Vui lòng yêu cầu liên kết mới.",
};
export function resetPathFor(ticket) {
    const base = ticket.scope === "admin" ? "/admin" : "/account";
    return `${base}/reset-password?token=${ticket.token}`;
}
