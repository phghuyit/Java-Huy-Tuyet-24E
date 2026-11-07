export const POINT_RATE = 10_000;
export const TIERS = [
    {
        key: "member",
        name: "Thành viên",
        min: 0,
        perk: "Lưu lịch sử đặt lịch và thông tin ưa thích",
    },
    {
        key: "silver",
        name: "Bạc",
        min: 500,
        perk: "Ưu tiên giữ chỗ khung giờ cuối tuần",
    },
    {
        key: "gold",
        name: "Vàng",
        min: 1500,
        perk: "Tặng gội đầu thư giãn mỗi 5 lần hẹn",
    },
    {
        key: "platinum",
        name: "Bạch kim",
        min: 4000,
        perk: "Chuyên viên riêng và ưu đãi sinh nhật",
    },
];
export function pointsFromSpend(totalSpend) {
    return Math.floor(Math.max(0, totalSpend) / POINT_RATE);
}
export function tierFor(points) {
    return [...TIERS].reverse().find((tier) => points >= tier.min) ?? TIERS[0];
}
export function tierProgress(points) {
    const tier = tierFor(points);
    const next = TIERS[TIERS.indexOf(tier) + 1] ?? null;
    if (!next)
        return { tier, next: null, remaining: 0, progress: 1 };
    const span = next.min - tier.min;
    return {
        tier,
        next,
        remaining: Math.max(0, next.min - points),
        progress: span > 0 ? Math.min(1, (points - tier.min) / span) : 1,
    };
}
