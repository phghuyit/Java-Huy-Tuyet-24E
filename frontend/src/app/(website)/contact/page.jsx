import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { TODAY, weekdayKey } from "@/lib/clock";
import { BRAND, businessHours, siteContent } from "@/data/site";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/website/page-header";
import { BookingCta } from "@/components/website/booking-cta";
import {
  FacebookGlyph,
  InstagramGlyph,
  TikTokGlyph,
} from "@/components/website/social-glyphs";
export const metadata = {
  title: "Liên hệ",
  description:
    "Địa chỉ, giờ mở cửa và cách liên hệ với salon VELA — 842 Valencia Street, San Francisco.",
};
const { contact, social } = siteContent;
const SOCIALS = [
  { label: "Instagram", href: social.instagram, Glyph: InstagramGlyph },
  { label: "Facebook", href: social.facebook, Glyph: FacebookGlyph },
  { label: "TikTok", href: social.tiktok, Glyph: TikTokGlyph },
];
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(contact.addressLines.join(", "))}&output=embed`;
export default function ContactPage() {
  const today = weekdayKey(TODAY);
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]}
        lines={["GHÉ THĂM", "SALON."]}
        description="Chúng tôi ở ngay trên phố Valencia. Gọi trước hoặc đặt lịch online — cả hai đều được, và bạn không cần tài khoản."
      />

      <section className="gutter grid grid-cols-1 gap-x-16 gap-y-14 py-16 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <dl className="border-t border-ink/12">
            <Row icon={MapPin} label="Địa chỉ">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="eyebrow group mt-3 inline-flex items-center gap-2 text-ink/60 transition-colors hover:text-ink"
              >
                Chỉ đường
                <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Row>

            <Row icon={Phone} label="Điện thoại">
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="text-[1.125rem] transition-colors hover:text-champagne"
              >
                {contact.phone}
              </a>
              <span className="mt-2 block text-[0.8125rem] text-ink/45">
                Gọi trong giờ mở cửa để được tư vấn nhanh nhất.
              </span>
            </Row>

            <Row icon={Mail} label="Email">
              <a
                href={`mailto:${contact.email}`}
                className="break-all transition-colors hover:text-champagne"
              >
                {contact.email}
              </a>
            </Row>
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <MagneticButton href="/booking" size="cta">
              ĐẶT LỊCH ONLINE
            </MagneticButton>
            <Link
              href="/booking/lookup"
              className="eyebrow inline-flex items-center gap-2 border-b border-ink/25 pb-2 text-ink/70 transition-colors hover:border-ink hover:text-ink"
            >
              TRA CỨU LỊCH HẸN
            </Link>
          </div>

          <div className="mt-12 border-t border-ink/12 pt-7">
            <h2 className="eyebrow text-ink/40">Theo dõi VELA</h2>
            <ul className="mt-5 flex items-center gap-3">
              {SOCIALS.map(({ label, href, Glyph }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex size-11 items-center justify-center border border-ink/15 text-ink/55 transition-colors hover:border-ink hover:text-ink"
                  >
                    <Glyph className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <div className="border border-ink/12">
              <div className="flex items-center gap-2.5 border-b border-ink/12 px-6 py-4">
                <Clock className="size-3.5 text-champagne" />
                <h2 className="eyebrow text-ink/50">Giờ mở cửa</h2>
              </div>

              <ul className="px-6 py-2">
                {businessHours.map((entry) => {
                  const isToday = entry.day === today;
                  return (
                    <li
                      key={entry.day}
                      className={cn(
                        "flex items-baseline justify-between border-b border-ink/10 py-3.5 last:border-b-0",
                        isToday && "text-ink",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[0.9375rem]",
                          isToday ? "text-ink" : "text-ink/60",
                        )}
                      >
                        {entry.label}
                        {isToday ? (
                          <span className="eyebrow ml-3 text-champagne">
                            Hôm nay
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "text-[0.9375rem] tabular",
                          entry.open ? "text-ink/80" : "text-ink/30",
                        )}
                      >
                        {entry.open && entry.close
                          ? `${entry.open} — ${entry.close}`
                          : "Nghỉ"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="mt-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-ink/12 bg-nude/20">
              <iframe
                src={MAP_EMBED}
                title={`Bản đồ tới ${BRAND.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            </div>
            <p className="mt-3 text-[0.75rem] text-ink/40">
              Không xem được bản đồ?{" "}
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline decoration-ink/30 underline-offset-4"
              >
                Mở trong Google Maps
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <BookingCta lines={["GHÉ SALON,", "HOẶC ĐẶT TRƯỚC."]} />
    </>
  );
}
function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-5 border-b border-ink/12 py-6">
      <Icon className="mt-1 size-4 shrink-0 text-champagne" />
      <div>
        <dt className="eyebrow text-ink/40">{label}</dt>
        <dd className="mt-3 text-[1rem] leading-relaxed text-ink/75">
          {children}
        </dd>
      </div>
    </div>
  );
}
