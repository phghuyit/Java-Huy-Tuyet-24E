"use client";
import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pad2 } from "@/lib/format";
import { siteContent } from "@/data";
import { businessHours } from "@/data/site";
import { staffService } from "@/services";
import { slugify } from "@/util";
import { MaskImage, Parallax } from "@/components/motion/media";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Marquee } from "@/components/motion/marquee";
import { BookingCta } from "@/components/website/booking-cta";
import { PageHeader } from "@/components/website/page-header";
import { SectionTitle } from "@/components/website/section";
const metadata = {
  title: "Về VELA",
  description:
    "VELA là salon trên phố Valencia, nơi mọi buổi hẹn bắt đầu bằng việc lắng nghe mong muốn của bạn.",
};
const PRINCIPLES = [
  {
    title: "Bắt đầu bằng sự lắng nghe",
    body: "Chúng tôi trao đổi về mong muốn và tình trạng hiện tại trước khi thực hiện, để mỗi lựa chọn đều phù hợp với bạn.",
  },
  {
    title: "Tư vấn điều phù hợp",
    body: "Nếu màu tóc chưa phù hợp với tình trạng tóc, chuyên viên sẽ giải thích và đề xuất lựa chọn an toàn hơn.",
  },
  {
    title: "Ghi nhớ từng buổi hẹn",
    body: "Lịch sử dịch vụ và ghi chú được lưu trong hồ sơ, giúp salon chuẩn bị chu đáo cho lần ghé tiếp theo.",
  },
  {
    title: "Đặt lịch rõ ràng",
    body: "Bạn chọn dịch vụ, nhân viên và giờ phù hợp, kiểm tra thông tin rồi gửi yêu cầu để salon xác nhận.",
  },
];
export default function AboutPage() {
  const { about, contact } = siteContent;
  const [artists, setArtists] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    staffService
      .getAll()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const mapped = data
          .filter((s) => s.status === "ACTIVE" || s.active !== false)
          .map((s) => ({
            id: String(s.id),
            slug: s.slug || slugify(s.name) || `staff-${s.id}`,
            name: s.name,
            role: s.role || "Chuyên viên làm đẹp",
            discipline: s.specialization || "Nail Artist",
          }));
        setArtists(mapped);
      })
      .catch((err) => {
        console.error("Failed to load staff in About page:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Về VELA" }]}
        lines={["MỘT KHÔNG GIAN", "BIẾT LẮNG NGHE."]}
        description={about.lead}
      />

      <section className="gutter pt-14 md:pt-20">
        <MaskImage
          immediate
          priority
          src={about.image}
          alt="Không gian salon VELA trên phố Valencia"
          sizes="100vw"
          className="aspect-[16/9] w-full"
        />
      </section>

      <section className="gutter grid grid-cols-1 gap-x-16 gap-y-12 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal>
            <h2 className="font-display text-d3 font-light">{about.title}</h2>
          </Reveal>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <RevealGroup stagger={0.1}>
            {about.body.map((paragraph, i) => (
              <RevealItem key={i}>
                <p
                  className={
                    i === 0
                      ? "text-[1.125rem] leading-relaxed text-ink/75"
                      : "mt-7 text-[1rem] leading-relaxed text-ink/55"
                  }
                >
                  {paragraph}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-y border-ink/10">
        <div className="gutter grid grid-cols-2 lg:grid-cols-4">
          {about.stats.map((stat, i) => (
            <Reveal
              key={stat.label}
              delay={i * 0.08}
              className="border-ink/10 py-12 [&:nth-child(even)]:border-l lg:border-l lg:first:border-l-0 lg:[&:nth-child(even)]:border-l"
            >
              <div className="px-2 lg:px-8">
                <p className="font-display text-[3.5rem] leading-none tracking-tight md:text-[4.5rem]">
                  {stat.value}
                </p>
                <p className="eyebrow mt-4 text-ink/40">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-void py-24 text-paper md:py-32" data-tone="dark">
        <div className="gutter">
          <SectionTitle
            index="—"
            eyebrow="Cách chúng tôi làm việc"
            lines={["BỐN GIÁ TRỊ", "LUÔN GÌN GIỮ."]}
            tone="dark"
          />

          <RevealGroup
            className="mt-20 grid grid-cols-1 gap-x-12 gap-y-14 md:grid-cols-2"
            stagger={0.1}
          >
            {PRINCIPLES.map((principle, i) => (
              <RevealItem key={principle.title}>
                <div className="border-t border-paper/15 pt-7">
                  <span className="eyebrow tabular text-champagne">
                    {pad2(i + 1)}
                  </span>
                  <h3 className="mt-5 font-display text-[1.875rem] leading-tight tracking-tight">
                    {principle.title}
                  </h3>
                  <p className="mt-4 max-w-[42ch] text-[0.9375rem] leading-relaxed text-paper/50">
                    {principle.body}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <div className="border-b border-ink/10 py-6">
        <Marquee
          items={[
            "VALENCIA STREET",
            "SAN FRANCISCO",
            "TỪ NĂM 2023",
            "KHÔNG GIAN RIÊNG",
            "ĐỘI NGŨ TẬN TÂM",
          ]}
          className="font-display text-[1.75rem] leading-none tracking-tight text-ink/60 md:text-[2.25rem]"
          slow
        />
      </div>

      <section className="gutter py-24 md:py-32">
        <SectionTitle
          index="—"
          eyebrow="Đội ngũ VELA"
          lines={["NHỮNG NGƯỜI BẠN SẼ GẶP"]}
          size="d2"
          link={{ label: "Tất cả nhân viên", href: "/artists" }}
        />
        <RevealGroup className="mt-16 border-t border-ink/12" stagger={0.07}>
          {artists.map((artist, i) => (
            <RevealItem key={artist.id}>
              <Link
                href={`/artists/${artist.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 border-b border-ink/12 py-6 md:grid-cols-[4rem_1fr_1fr_auto]"
              >
                <span className="eyebrow tabular text-ink/25">
                  {pad2(i + 1)}
                </span>
                <span className="font-display text-[1.75rem] leading-none tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 md:text-[2.25rem]">
                  {artist.name}
                </span>
                <span className="hidden text-[0.875rem] text-ink/45 md:block">
                  {artist.role} · {artist.discipline}
                </span>
                <ArrowUpRight className="size-4 text-ink/20 transition-colors group-hover:text-champagne" />
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="gutter border-t border-ink/10 py-24 md:py-32">
        <div className="grid grid-cols-1 gap-x-16 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <AnimatedText
              as="h2"
              lines={["GHÉ THĂM", "SALON VELA"]}
              className="font-display text-d2 font-light"
            />
            <Reveal delay={0.12}>
              <address className="mt-10 space-y-2 not-italic text-[1.0625rem] text-ink/70">
                {contact.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </address>
              <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="eyebrow border-b border-ink/25 pb-1.5 text-ink/70 transition-colors hover:border-ink hover:text-ink"
                >
                  {contact.phone}
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="eyebrow border-b border-ink/25 pb-1.5 text-ink/70 transition-colors hover:border-ink hover:text-ink"
                >
                  {contact.email}
                </a>
              </div>
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="eyebrow group mt-8 inline-flex items-center gap-2 text-champagne"
              >
                Xem đường đi
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Parallax distance={40}>
              <h3 className="eyebrow text-ink/40">Giờ hoạt động</h3>
              <ul className="mt-6 border-t border-ink/12">
                {businessHours.map((entry) => (
                  <li
                    key={entry.day}
                    className="flex items-baseline justify-between border-b border-ink/12 py-4"
                  >
                    <span className="text-[1.0625rem] text-ink/75">
                      {entry.label}
                    </span>
                    <span className="text-[1.0625rem] tabular text-ink">
                      {entry.open && entry.close
                        ? `${entry.open} — ${entry.close}`
                        : "Nghỉ"}
                    </span>
                  </li>
                ))}
              </ul>
            </Parallax>
          </div>
        </div>
      </section>

      <BookingCta />
    </>
  );
}
