"use client";
import * as React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { PHOTOS, img } from "@/data/images";
import { POINT_RATE, TIERS } from "@/lib/loyalty";
import { currency } from "@/lib/format";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal } from "@/components/motion/reveal";
const BENEFITS = [
    "Xem lại toàn bộ lịch hẹn đã đặt và sắp tới",
    `Tích ${1} điểm cho mỗi ${currency(POINT_RATE)} đã sử dụng dịch vụ`,
    "Đặt lịch nhanh hơn với thông tin đã lưu",
    "Ưu đãi theo hạng thành viên",
];
export function AccountAuthLayout({ eyebrow, lines, description, children, footer, }) {
    return (<section className="gutter grid grid-cols-1 gap-x-16 gap-y-14 pb-24 pt-36 md:pt-44 lg:grid-cols-12 lg:pb-32">
      <div className="lg:col-span-5">
        <p className="eyebrow text-champagne">{eyebrow}</p>
        <AnimatedText as="h1" immediate lines={lines} className="mt-5 font-display text-d2 font-light"/>
        <p className="mt-5 max-w-[42ch] text-[0.9375rem] leading-relaxed text-ink/55">
          {description}
        </p>

        <div className="mt-10">{children}</div>

        {footer ? (<div className="mt-8 border-t border-ink/10 pt-6">{footer}</div>) : null}
      </div>

      <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-nude/30 lg:aspect-[4/5]">
          <Image src={img(PHOTOS.interior[0], 1400)} alt="" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-void/90 via-void/40 to-transparent"/>

          <div className="absolute inset-x-0 bottom-0 p-7 text-paper md:p-9">
            <p className="eyebrow text-champagne">Thành viên VELA</p>
            <ul className="mt-6 space-y-3.5">
              {BENEFITS.map((benefit) => (<li key={benefit} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-champagne"/>
                  <span className="text-[0.875rem] leading-relaxed text-paper/85">
                    {benefit}
                  </span>
                </li>))}
            </ul>

            <p className="mt-7 border-t border-paper/15 pt-5 text-[0.75rem] text-paper/45">
              {TIERS.map((tier) => tier.name).join(" · ")}
            </p>
          </div>
        </div>
      </Reveal>
    </section>);
}
