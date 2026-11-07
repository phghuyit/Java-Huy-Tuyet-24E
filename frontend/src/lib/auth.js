export const SESSION_HOURS = 8;
export function hashPassword(password) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < password.length; i += 1) {
        hash ^= password.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    let avalanche = hash;
    for (let round = 0; round < 3; round += 1) {
        avalanche = Math.imul(avalanche ^ (avalanche >>> 15), 0x2545f491) >>> 0;
    }
    return `vela$1$${hash.toString(36)}$${avalanche.toString(36)}`;
}
export function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}
export function issueToken(user) {
    const encode = (value) => btoa(JSON.stringify(value))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    const issuedAt = Math.floor(Date.now() / 1000);
    const header = { alg: "none", typ: "JWT" };
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role.toUpperCase(),
        iat: issuedAt,
        exp: issuedAt + SESSION_HOURS * 3600,
    };
    return `${encode(header)}.${encode(payload)}.auth`;
}
export function buildSession(user) {
    return {
        token: issueToken(user),
        user: { id: user.id, name: user.name, email: user.email, role: user.role, staffId: user.staffId },
        expiresAt: new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString(),
    };
}
export function isExpired(session) {
    return new Date(session.expiresAt).getTime() <= Date.now();
}
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateCredentials(email, password) {
    if (!EMAIL_PATTERN.test(email.trim()))
        return "Email không hợp lệ.";
    if (password.length < 8)
        return "Mật khẩu tối thiểu 8 ký tự.";
    return null;
}
