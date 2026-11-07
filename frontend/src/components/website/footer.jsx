"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BRAND, siteContent, websiteNav, businessHours } from "@/data/site";
import { InstagramGlyph, FacebookGlyph, TikTokGlyph } from "@/components/website/social-glyphs";
const socials = [
    { label: "Instagram", href: siteContent.social.instagram, Glyph: InstagramGlyph },
    { label: "Facebook", href: siteContent.social.facebook, Glyph: FacebookGlyph },
    { label: "TikTok", href: siteContent.social.tiktok, Glyph: TikTokGlyph },
];
export function Footer() {
    return (<footer className="relative overflow-hidden bg-void text-paper">
      <div className="gutter relative z-10 pt-24 md:pt-32">
        <div className="grid gap-16 border-b border-paper/10 pb-16 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr] lg:gap-10">
          <div>
            <p className="font-display text-[2.75rem] leading-none tracking-[-0.02em]">
              {BRAND.wordmark}
            </p>
            <p className="mt-4 max-w-[22ch] font-display text-[1.375rem] italic leading-snug text-paper/60">

              Vẻ đẹp, dành riêng cho bạn.
            </p>
            <Link href="/booking" className="eyebrow group mt-8 inline-flex items-center gap-2 border-b border-champagne/40 pb-2 text-champagne transition-colors hover:border-champagne">

              Đặt lịch hẹn
              <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
            </Link>
          </div>

          <nav>
            <h2 className="eyebrow text-paper/35">Khám phá</h2>
            <ul className="mt-6 space-y-3">
              {[
            ...websiteNav,
            { label: "Đặt lịch", href: "/booking" },
            { label: "Tra cứu lịch hẹn", href: "/booking/lookup" },
            { label: "Câu hỏi thường gặp", href: "/faq" },
        ].map((item) => (<li key={item.href}>
                  <Link href={item.href} className="text-[0.9375rem] text-paper/70 transition-colors hover:text-champagne">
                    {item.label}
                  </Link>
                </li>))}
              <li>
                <Link href="/admin/login" className="text-[0.9375rem] text-paper/40 transition-colors hover:text-champagne">

                  Quản trị salon
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow text-paper/35">Salon</h2>
            <address className="mt-6 space-y-3 not-italic text-[0.9375rem] leading-relaxed text-paper/70">
              {siteContent.contact.addressLines.map((line) => (<p key={line}>{line}</p>))}
              <p>
                <a href={`tel:${siteContent.contact.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-champagne">
                  {siteContent.contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${siteContent.contact.email}`} className="transition-colors hover:text-champagne">
                  {siteContent.contact.email}
                </a>
              </p>
            </address>

            <ul className="mt-7 flex items-center gap-4">
              {socials.map(({ label, href, Glyph }) => (<li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex size-9 items-center justify-center border border-paper/15 text-paper/60 transition-colors hover:border-champagne hover:text-champagne">
                    <Glyph className="size-4"/>
                  </a>
                </li>))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow text-paper/35">Giờ hoạt động</h2>
            <ul className="mt-6 space-y-2.5">
              {businessHours.map((entry) => (<li key={entry.day} className="flex items-baseline justify-between gap-6 text-[0.875rem]">
                  <span className="text-paper/55">{entry.label}</span>
                  <span className="tabular text-paper/80">
                    {entry.open && entry.close
                ? `${entry.open} — ${entry.close}`
                : "Nghỉ"}
                  </span>
                </li>))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-8 text-[0.75rem] text-paper/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name}  Salon — {BRAND.city}
          </p>
          <p className="eyebrow">{BRAND.established}</p>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none relative -mb-[0.22em] select-none overflow-hidden">
        <p className="whitespace-nowrap text-center font-display text-[24vw] leading-[0.75] tracking-[-0.05em] text-paper/[0.055]">
          {BRAND.wordmark}
        </p>
      </div>
    </footer>);
}
