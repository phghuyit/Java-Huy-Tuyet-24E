import { addDays, TODAY } from "@/lib/clock";
import { appointments } from "./appointments";
import { customers } from "./customers";
const editorial = [
    {
        id: "rev-001",
        author: "Sarah M.",
        appointmentId: null,
        customerId: "cus-sarah",
        staffId: "stf-amelia",
        serviceId: "svc-balayage",
        rating: 5,
        body: "Cuối cùng tôi đã tìm được salon hiểu đúng điều mình mong muốn.",
        createdAt: addDays(TODAY, -7),
        published: true,
        highlighted: true,
    },
    {
        id: "rev-002",
        author: "Jade M.",
        appointmentId: null,
        customerId: "cus-jade",
        staffId: "stf-rhea",
        serviceId: "svc-head-spa",
        rating: 5,
        body: "Một buổi gội đầu rất thư giãn. Tôi đã quay lại vì cách chăm sóc chu đáo.",
        createdAt: addDays(TODAY, -3),
        published: true,
        highlighted: true,
    },
    {
        id: "rev-003",
        author: "Lisa W.",
        appointmentId: null,
        customerId: "cus-lisa",
        staffId: "stf-sophia",
        serviceId: "svc-signature-blonde",
        rating: 5,
        body: "Sophia tư vấn rõ ràng và chọn màu tóc rất phù hợp với tôi.",
        createdAt: addDays(TODAY, -21),
        published: true,
        highlighted: true,
    },
    {
        id: "rev-004",
        author: "Emma L.",
        appointmentId: null,
        customerId: "cus-emma",
        staffId: "stf-maya",
        serviceId: "svc-gel-set",
        rating: 5,
        body: "Bộ móng được làm tỉ mỉ và vẫn đẹp sau nhiều tuần.",
        createdAt: addDays(TODAY, -12),
        published: true,
        highlighted: true,
    },
    {
        id: "rev-005",
        author: "Priya R.",
        appointmentId: null,
        customerId: "cus-priya",
        staffId: "stf-rhea",
        serviceId: "svc-signature-facial",
        rating: 5,
        body: "Rhea giúp tôi chọn cách chăm sóc da đơn giản và phù hợp.",
        createdAt: addDays(TODAY, -14),
        published: true,
        highlighted: true,
    },
    {
        id: "rev-006",
        author: "Hannah B.",
        appointmentId: null,
        customerId: "cus-hannah",
        staffId: "stf-amelia",
        serviceId: "svc-haircut",
        rating: 5,
        body: "Buổi hẹn yên tĩnh như tôi mong muốn. Kiểu tóc cũng rất đẹp.",
        createdAt: addDays(TODAY, -17),
        published: true,
        highlighted: false,
    },
    {
        id: "rev-007",
        author: "Grace W.",
        appointmentId: null,
        customerId: "cus-grace",
        staffId: "stf-amelia",
        serviceId: "svc-balayage",
        rating: 5,
        body: "Mỗi lần quay lại, tôi đều hài lòng với màu tóc.",
        createdAt: addDays(TODAY, -30),
        published: true,
        highlighted: false,
    },
    {
        id: "rev-008",
        author: "Mei T.",
        appointmentId: null,
        customerId: "cus-mei",
        staffId: "stf-rhea",
        serviceId: "svc-volume-lash",
        rating: 4,
        body: "Dáng mi đẹp và phù hợp với mắt. Buổi hẹn hơi lâu hơn dự kiến.",
        createdAt: addDays(TODAY, -40),
        published: true,
        highlighted: false,
    },
    {
        id: "rev-009",
        author: "Isabel D.",
        appointmentId: null,
        customerId: "cus-isabel",
        staffId: "stf-maya",
        serviceId: "svc-nail-art",
        rating: 5,
        body: "Maya điều chỉnh mẫu móng theo dáng tay tôi rất tinh tế.",
        createdAt: addDays(TODAY, -8),
        published: true,
        highlighted: false,
    },
    {
        id: "rev-010",
        author: "Chloé B.",
        appointmentId: null,
        customerId: "cus-chloe",
        staffId: "stf-rhea",
        serviceId: "svc-glow-peel",
        rating: 5,
        body: "Làn da mềm mại sau buổi chăm sóc. Nhân viên hướng dẫn rất kỹ.",
        createdAt: addDays(TODAY, -6),
        published: true,
        highlighted: false,
    },
    {
        id: "rev-011",
        author: "Olivia F.",
        appointmentId: null,
        customerId: "cus-olivia",
        staffId: "stf-sophia",
        serviceId: "svc-glass-treatment",
        rating: 4,
        body: "Liệu trình phục hồi phù hợp với tóc mảnh của tôi.",
        createdAt: addDays(TODAY, -60),
        published: true,
        highlighted: false,
    },
    {
        id: "rev-012",
        author: "Nadia P.",
        appointmentId: null,
        customerId: "cus-nadia",
        staffId: "stf-rhea",
        serviceId: "svc-volume-lash",
        rating: 5,
        body: "Lần đầu nối mi nên tôi khá lo. Nhân viên giải thích từng bước rõ ràng.",
        createdAt: addDays(TODAY, -13),
        published: false,
        highlighted: false,
    },
    {
        id: "rev-013",
        author: "Amara D.",
        appointmentId: null,
        customerId: "cus-amara",
        staffId: "stf-maya",
        serviceId: "svc-classic-mani",
        rating: 3,
        body: "Bộ móng đẹp nhưng hôm đó tôi phải đợi thêm một chút.",
        createdAt: addDays(TODAY, -34),
        published: false,
        highlighted: false,
    },
    {
        id: "rev-014",
        author: "Yuki S.",
        appointmentId: null,
        customerId: "cus-yuki",
        staffId: "stf-rhea",
        serviceId: "svc-head-spa",
        rating: 5,
        body: "Không gian yên tĩnh, rất phù hợp để thư giãn.",
        createdAt: addDays(TODAY, -20),
        published: true,
        highlighted: false,
    },
];
function mulberry32(seed) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const RATING_WEIGHTS = [
    [5, 0.62],
    [4, 0.24],
    [3, 0.09],
    [2, 0.04],
    [1, 0.01],
];
const BODIES = {
    5: [
        "Rất hài lòng. Kỹ thuật viên tư vấn kỹ và làm đúng như mong muốn.",
        "Không gian yên tĩnh, nhân viên nhẹ nhàng. Sẽ quay lại.",
        "Kết quả đẹp hơn mình tưởng tượng. Cảm ơn cả nhà.",
        "Đúng giờ, sạch sẽ, tay nghề tốt. Không có gì để chê.",
        "Lần thứ ba quay lại và vẫn giữ nguyên chất lượng.",
        "Được tư vấn rất thật, không cố bán thêm dịch vụ.",
    ],
    4: [
        "Kết quả tốt, chỉ là hôm đó salon hơi đông.",
        "Hài lòng với dịch vụ. Giá hơi cao một chút so với mặt bằng chung.",
        "Làm đẹp, nhưng thời gian lâu hơn dự kiến khoảng nửa tiếng.",
        "Nhân viên thân thiện. Mình sẽ thử thêm dịch vụ khác lần sau.",
    ],
    3: [
        "Ổn nhưng chưa thực sự ấn tượng. Có thể do mình kỳ vọng hơi cao.",
        "Dịch vụ bình thường, phải chờ thêm khá lâu mới tới lượt.",
        "Kết quả tạm ổn, mong lần sau được tư vấn kỹ hơn trước khi làm.",
    ],
    2: [
        "Không đúng như mình mô tả lúc đặt lịch. Hơi tiếc.",
        "Phải chờ khá lâu dù đã đặt trước giờ cụ thể.",
    ],
    1: [
        "Trải nghiệm không như mong đợi, mong salon cải thiện khâu tư vấn.",
    ],
};
function shortName(full) {
    const parts = full.trim().split(/\s+/);
    if (parts.length < 2)
        return full;
    return `${parts.slice(1).join(" ")} ${parts[0][0]}.`;
}
function buildReviews() {
    const rng = mulberry32(20260920);
    const byId = new Map(customers.map(item => [item.id, item]));
    const rows = [];
    const done = appointments
        .filter(item => item.status === "COMPLETED")
        .sort((a, b) => `${a.appointmentDate}${a.startTime}`.localeCompare(`${b.appointmentDate}${b.startTime}`));
    for (const visit of done) {
        if (rng() > 0.38)
            continue;
        const customer = byId.get(visit.customerId);
        if (!customer)
            continue;
        let roll = rng();
        let rating = 5;
        for (const [value, weight] of RATING_WEIGHTS) {
            if (roll < weight) {
                rating = value;
                break;
            }
            roll -= weight;
        }
        const pool = BODIES[rating];
        rows.push({
            id: `rev-gen-${rows.length + 1}`,
            author: shortName(customer.name),
            appointmentId: visit.id,
            customerId: customer.id,
            staffId: visit.staffId,
            serviceId: visit.serviceIds[0] ?? null,
            rating,
            body: pool[Math.floor(rng() * pool.length) % pool.length],
            createdAt: addDays(visit.appointmentDate, 1),
            published: rating >= 3,
            highlighted: false,
        });
    }
    return rows;
}
export const reviews = [...editorial, ...buildReviews()];
