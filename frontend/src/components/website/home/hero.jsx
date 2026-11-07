import Link from "next/link";
import { MaskImage, ScrollScale } from "@/components/motion/media";
import { AnimatedText } from "@/components/motion/animated-text";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { siteContent } from "@/data/site";
const { hero } = siteContent;
export function Hero() {
    return (<section className="relative isolate min-h-[100svh] overflow-hidden pt-32 md:pt-40 lg:pt-0">
      <div className="gutter relative z-10 grid min-h-[100svh] grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6 lg:pr-8 xl:col-span-6">
          <Reveal direction="none" className="mb-10 flex items-center gap-4">
            <span className="h-px w-10 bg-champagne"/>
            <span className="eyebrow text-ink/50">{hero.eyebrow}</span>
          </Reveal>

          <AnimatedText as="h1" immediate lines={hero.titleLines} className="font-display text-d0 font-light text-ink"/>

          <Reveal delay={0.55} className="mt-9 max-w-[38ch]">
            <p className="text-[1.0625rem] leading-relaxed text-ink/60">
              {hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.68} className="mt-11 flex flex-wrap items-center gap-4">
            <MagneticButton href="/booking" variant="solid" size="cta">
              {hero.primaryCta}
            </MagneticButton>
            <Link href="/services" className="eyebrow group inline-flex items-center gap-2 border-b border-ink/25 pb-2 text-ink/70 transition-colors hover:border-ink hover:text-ink">
              {hero.secondaryCta}
            </Link>
          </Reveal>

          <Reveal delay={0.82} className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-ink/10 pt-6 lg:mb-16">
            <Stat value="4,9" label="Đánh giá trung bình"/>
            <Stat value="2.400" label="Khách hàng"/>
            <Stat value="4" label="Nhân viên"/>
          </Reveal>
        </div>

        <div className="relative lg:col-span-6">
          <ScrollScale from={0.96} className="relative aspect-[4/5] w-full lg:absolute lg:-right-5 lg:top-1/2 lg:h-[82vh] lg:w-[46vw] lg:-translate-y-1/2 xl:-right-16">
            <MaskImage immediate priority delay={0.2} src={hero.image} alt="Chuyên viên chăm sóc tóc cho khách tại VELA" sizes="(max-width: 1024px) 100vw, 46vw" className="h-full w-full"/>
          </ScrollScale>

          <Reveal delay={1} className="relative z-20 -mt-12 ml-5 w-fit bg-ivory px-5 py-4 lg:absolute lg:bottom-[9vh] lg:left-[-3.5rem] lg:mt-0">
            <p className="eyebrow text-ink/40">Sẵn sàng đón bạn</p>
            <p className="mt-2 font-display text-[1.375rem] leading-none">

              Tư vấn & chăm sóc tóc
            </p>
          </Reveal>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 left-5 z-20 hidden items-center gap-3 md:left-10 lg:flex xl:left-16">
        <span className="eyebrow text-ink/35">Cuộn để khám phá</span>
        <span className="relative block h-px w-14 overflow-hidden bg-ink/15">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-scroll-cue bg-ink/60"/>
        </span>
      </div>
    </section>);
}
function Stat({ value, label }) {
    return (<div>
      <p className="font-display text-[1.75rem] leading-none tracking-tight">
        {value}
      </p>
      <p className="eyebrow mt-2 text-ink/40">{label}</p>
    </div>);
}
