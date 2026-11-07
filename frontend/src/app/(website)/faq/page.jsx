import Link from "next/link";
import { Plus } from "lucide-react";
import { currency } from "@/lib/format";
import { POINT_RATE, TIERS } from "@/lib/loyalty";
import { RESET_MINUTES } from "@/lib/password-reset";
import { siteContent } from "@/data/site";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/website/page-header";
import { BookingCta } from "@/components/website/booking-cta";
export const metadata = {
  title: "Câu hỏi thường gặp",
  description:
    "Đặt lịch, hủy lịch, thanh toán, điểm tích lũy và tài khoản tại VELA — những câu khách hay hỏi nhất.",
};
const POLICY = {
  cancelNoticeHours: 4,
  lateGraceMinutes: 15,
  depositThreshold: 2_000_000,
  requiresDeposit: false,
};
const { contact } = siteContent;
const phoneHref = `tel:${contact.phone.replace(/\s/g, "")}`;
const GROUPS = [
  {
    title: "Đặt lịch",
    items: [
      {
        q: "Tôi có cần tạo tài khoản để đặt lịch không?",
        a: (
          <>
            Không. Bạn đặt lịch với họ tên, số điện thoại và email là xong. Tài
            khoản chỉ để xem lại lịch sử và tích điểm — bạn có thể{" "}
            <Link
              href="/account/register"
              className="underline underline-offset-4"
            >
              tạo sau
            </Link>{" "}
            bằng chính số điện thoại đã đặt, lịch sử cũ sẽ theo về.
          </>
        ),
      },
      {
        q: "Đặt xong bao lâu thì salon xác nhận?",
        a: (
          <>
            Lịch mới đặt ở trạng thái <strong>Chờ xác nhận</strong>. Salon xem
            và xác nhận trong giờ mở cửa; bạn sẽ thấy trạng thái đổi thành{" "}
            <strong>Đã xác nhận</strong> trong tài khoản hoặc khi tra cứu bằng
            mã đặt lịch.
          </>
        ),
      },
      {
        q: "Tôi chọn được chuyên viên không?",
        a: (
          <>
            Có. Ở bước chọn nhân viên bạn có thể chỉ định người quen tay, hoặc
            chọn “Không yêu cầu” để salon xếp người phù hợp và còn trống. Hệ
            thống chỉ hiện giờ mà chuyên viên đó thực sự rảnh và làm được dịch
            vụ bạn chọn.
          </>
        ),
      },
      {
        q: "Một lần đặt được nhiều dịch vụ không?",
        a: (
          <>
            Được. Ở bước chọn dịch vụ bạn tích bao nhiêu mục cũng được — tổng
            thời lượng và tổng giá cộng dồn ngay, và hệ thống chỉ hiện những
            khung giờ đủ dài cho cả buổi, với chuyên viên làm được{" "}
            <strong>tất cả</strong> dịch vụ bạn chọn. Nếu không ai làm được cả
            nhóm đó, hãy gọi{" "}
            <a href={phoneHref} className="underline underline-offset-4">
              {contact.phone}
            </a>{" "}
            để salon chia thành hai lượt.
          </>
        ),
      },
    ],
  },
  {
    title: "Đổi lịch & hủy lịch",
    items: [
      {
        q: "Tôi tự hủy lịch được không?",
        a: (
          <>
            Được, khi lịch còn ở trạng thái <strong>Chờ xác nhận</strong> hoặc{" "}
            <strong>Đã xác nhận</strong>. Vào{" "}
            <Link href="/account" className="underline underline-offset-4">
              tài khoản
            </Link>
            , hoặc{" "}
            <Link
              href="/booking/lookup"
              className="underline underline-offset-4"
            >
              tra cứu bằng mã đặt lịch
            </Link>{" "}
            và số điện thoại nếu bạn đặt không cần tài khoản. Sau khi bạn đã đến
            salon và được ghi nhận thì vui lòng báo trực tiếp nhân viên.
          </>
        ),
      },
      {
        q: "Nên báo hủy trước bao lâu?",
        a: (
          <>
            Mong bạn báo trước ít nhất{" "}
            <strong>{POLICY.cancelNoticeHours} giờ</strong> để salon kịp xếp
            khách khác vào khung giờ đó. Hủy muộn hơn vẫn được, chỉ là chỗ trống
            khó lấp.
          </>
        ),
      },
      {
        q: "Tôi muốn dời sang ngày khác thì làm sao?",
        a: (
          <>
            Bạn tự dời được, ngay trong{" "}
            <Link href="/account" className="underline underline-offset-4">
              tài khoản
            </Link>{" "}
            hoặc khi{" "}
            <Link
              href="/booking/lookup"
              className="underline underline-offset-4"
            >
              tra cứu bằng mã đặt lịch
            </Link>
            . Chọn “Đổi ngày giờ”, hệ thống chỉ hiện những khung giờ chuyên viên
            của bạn còn trống. Sau khi dời, lịch trở lại trạng thái{" "}
            <strong>Chờ xác nhận</strong> để salon xác nhận lại giờ mới. Muốn
            đổi sang chuyên viên khác thì gọi{" "}
            <a href={phoneHref} className="underline underline-offset-4">
              {contact.phone}
            </a>
            .
          </>
        ),
      },
      {
        q: "Đến muộn thì sao?",
        a: (
          <>
            Muộn trong khoảng <strong>{POLICY.lateGraceMinutes} phút</strong>{" "}
            salon vẫn phục vụ, nhưng có thể phải rút ngắn để không ảnh hưởng
            khách kế tiếp. Muộn hơn thì khung giờ có thể đã được xếp cho người
            khác — gọi trước cho salon luôn là cách tốt nhất.
          </>
        ),
      },
    ],
  },
  {
    title: "Giá & thanh toán",
    items: [
      {
        q: "Giá hiển thị đã là giá cuối chưa?",
        a: (
          <>
            Giá trên website là giá của dịch vụ đó và được giữ nguyên theo đúng
            mức tại thời điểm bạn đặt — kể cả khi salon đổi bảng giá sau đó. Nếu
            sau khi tư vấn bạn đổi sang dịch vụ khác, giá sẽ theo dịch vụ mới và
            nhân viên báo trước khi bắt đầu.
          </>
        ),
      },
      {
        q: "Có cần đặt cọc không?",
        a: POLICY.requiresDeposit ? (
          <>
            Các dịch vụ từ {currency(POLICY.depositThreshold)} trở lên cần đặt
            cọc trước. Nhân viên sẽ liên hệ hướng dẫn sau khi bạn đặt lịch.
          </>
        ) : (
          <>
            Không. Website không thu tiền và không giữ thông tin thẻ — bạn thanh
            toán trực tiếp tại salon sau khi hoàn tất dịch vụ.
          </>
        ),
      },
      {
        q: "Thanh toán bằng hình thức nào?",
        a: (
          <>
            Tiền mặt, chuyển khoản hoặc quẹt thẻ tại quầy. Mọi khoản thanh toán
            diễn ra tại salon.
          </>
        ),
      },
    ],
  },
  {
    title: "Tài khoản & điểm tích lũy",
    items: [
      {
        q: "Điểm tích lũy tính thế nào?",
        a: (
          <>
            Mỗi {currency(POINT_RATE)} chi cho dịch vụ{" "}
            <strong>đã hoàn thành</strong> được 1 điểm. Lịch bị hủy hoặc không
            đến không tính. Có {TIERS.length} hạng:{" "}
            {TIERS.map((tier, i) => (
              <span key={tier.key}>
                {i > 0 ? ", " : ""}
                <strong>{tier.name}</strong>
                {tier.min > 0
                  ? ` (từ ${tier.min.toLocaleString("vi-VN")} điểm)`
                  : ""}
              </span>
            ))}
            .
          </>
        ),
      },
      {
        q: "Tôi đặt lịch nhiều lần trước khi có tài khoản, điểm có mất không?",
        a: (
          <>
            Không mất. Khi{" "}
            <Link
              href="/account/register"
              className="underline underline-offset-4"
            >
              tạo tài khoản
            </Link>{" "}
            bằng đúng số điện thoại hoặc email đã dùng để đặt lịch, toàn bộ lịch
            sử và điểm sẽ tự động gắn vào tài khoản mới.
          </>
        ),
      },
      {
        q: "Tôi quên mật khẩu.",
        a: (
          <>
            Dùng{" "}
            <Link
              href="/account/forgot-password"
              className="underline underline-offset-4"
            >
              trang quên mật khẩu
            </Link>
            . Liên kết đặt lại có hiệu lực {RESET_MINUTES} phút và chỉ dùng được
            một lần. Nếu bạn từng đặt lịch mà chưa từng có mật khẩu, đây cũng là
            cách để tạo mật khẩu lần đầu.
          </>
        ),
      },
      {
        q: "Tôi muốn xóa tài khoản.",
        a: (
          <>
            Gọi{" "}
            <a href={phoneHref} className="underline underline-offset-4">
              {contact.phone}
            </a>{" "}
            hoặc gửi email tới{" "}
            <a
              href={`mailto:${contact.email}`}
              className="underline underline-offset-4"
            >
              {contact.email}
            </a>
            , salon sẽ xử lý giúp bạn.
          </>
        ),
      },
    ],
  },
];
export default function FaqPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Câu hỏi thường gặp" },
        ]}
        lines={["NHỮNG CÂU", "HAY ĐƯỢC HỎI."]}
        description="Không thấy câu bạn cần? Gọi salon, chúng tôi trả lời nhanh hơn email."
      />

      <section className="gutter py-16 md:py-20">
        <div className="grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {GROUPS.map((group, groupIndex) => (
              <Reveal
                key={group.title}
                delay={groupIndex * 0.05}
                className="mb-14 last:mb-0"
              >
                <h2 className="font-display text-[1.75rem] leading-none tracking-tight">
                  {group.title}
                </h2>

                <div className="mt-7 border-t border-ink/12">
                  {group.items.map((item) => (
                    <details
                      key={item.q}
                      className="group border-b border-ink/12 [&_summary::-webkit-details-marker]:hidden"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[1.0625rem] leading-snug transition-colors hover:text-champagne">
                        {item.q}
                        <Plus className="mt-1 size-4 shrink-0 text-ink/30 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45" />
                      </summary>
                      <div className="max-w-[62ch] pb-6 text-[0.9375rem] leading-relaxed text-ink/60 [&_strong]:font-normal [&_strong]:text-ink">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>

          <aside className="lg:col-span-4">
            <Reveal delay={0.15}>
              <div className="border border-ink/12 p-7 lg:sticky lg:top-28">
                <p className="eyebrow text-champagne">Còn thắc mắc?</p>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink/60">
                  Gọi trực tiếp là nhanh nhất — nhân viên tại quầy xem được lịch
                  và trả lời ngay trong giờ mở cửa.
                </p>

                <a
                  href={phoneHref}
                  className="mt-7 block font-display text-[1.75rem] leading-none tracking-tight transition-colors hover:text-champagne"
                >
                  {contact.phone}
                </a>

                <div className="mt-7 space-y-2.5 border-t border-ink/12 pt-6 text-[0.875rem]">
                  <Link
                    href="/contact"
                    className="block text-ink/60 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink"
                  >
                    Địa chỉ & giờ mở cửa
                  </Link>
                  <Link
                    href="/booking/lookup"
                    className="block text-ink/60 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink"
                  >
                    Tra cứu lịch hẹn bằng mã
                  </Link>
                  <Link
                    href="/services"
                    className="block text-ink/60 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink"
                  >
                    Bảng dịch vụ & giá
                  </Link>
                </div>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <BookingCta lines={["SẴN SÀNG RỒI?", "ĐẶT LỊCH THÔI."]} />
    </>
  );
}
