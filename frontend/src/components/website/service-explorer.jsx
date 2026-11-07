"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { durationLabel } from "@/lib/clock";
import { pad2, priceLabel } from "@/lib/format";
export function ServiceExplorer({ categories = [], services = [], initialCategory, compact = false, }) {
    const [selected, setSelected] = React.useState(initialCategory ?? categories[0]?.slug ?? "");
    const [hovered, setHovered] = React.useState(null);
    const active = categories.some(c => c.slug === selected) ? selected : categories[0]?.slug;
    const category = categories.find((c) => c.slug === active) ?? categories[0];
    const list = React.useMemo(() => services.filter((s) => s.categorySlug === active), [services, active]);
    const previewService = list.find((s) => s.id === hovered);
    const preview = previewService ?? null;
    if (!category)
        return <p role="status" className="py-10 text-ink/50">Chưa có dịch vụ đang hoạt động. Vui lòng quay lại sau.</p>;
    const rawImage = preview?.image ?? category.image;
    const previewImage = (rawImage && !rawImage.includes("placeholder"))
      ? rawImage
      : "/images/photo-1610992015836-7c249d75782d.jpg";
    const previewKey = preview?.id ?? category.id;
    return (<div className="grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <ul className={cn("hide-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0")}>
          {categories.map((item, i) => {
            const isActive = item.slug === active;
            return (<li key={item.id} className="shrink-0">
                <button type="button" onMouseEnter={() => {
                    setSelected(item.slug);
                    setHovered(null);
                }} onFocus={() => setSelected(item.slug)} onClick={() => {
                    setSelected(item.slug);
                    setHovered(null);
                }} className="group flex items-baseline gap-4 py-1.5 text-left lg:py-2" aria-pressed={isActive}>
                  <span className={cn("eyebrow tabular hidden transition-colors duration-200 lg:block", isActive ? "text-champagne" : "text-ink/25")}>
                    {pad2(i + 1)}
                  </span>
                  <span className={cn("font-display text-[1.75rem] leading-none tracking-tight transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:text-[3rem]", isActive
                    ? "text-ink lg:translate-x-1"
                    : "text-ink/25 group-hover:text-ink/55")}>
                    {item.name}
                  </span>
                </button>
              </li>);
        })}
        </ul>

        {!compact ? (<p className="mt-8 hidden max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink/50 lg:block">
            {category.description}
          </p>) : null}

        <div className="relative mt-10 hidden aspect-[5/4] w-full overflow-hidden bg-nude/25 lg:block">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={previewKey} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
              <Image src={previewImage} alt={preview?.name ?? category.name} fill sizes="40vw" className="object-cover"/>
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/70 to-transparent p-6">
            <p className="eyebrow text-paper/60">
              {preview ? "Dịch vụ" : "Danh mục"}
            </p>
            <p className="mt-2 font-display text-[1.5rem] leading-none text-paper">
              {preview?.name ?? category.name}
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7">
        <div className="border-t border-ink/12">
          {!list.length && <p role="status" className="py-10 text-ink/50">Danh mục chưa có dịch vụ đang hoạt động.</p>}
          {list.map((service) => (<Link key={service.id} href={`/services/${service.slug}`} onMouseEnter={() => setHovered(service.id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(service.id)} onBlur={() => setHovered(null)} className="group block border-b border-ink/12 py-6 md:py-7">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h3 className="font-display text-[1.625rem] leading-none tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 md:text-[2rem]">
                  {service.name}
                </h3>

                <div className="flex items-baseline gap-6 sm:gap-8">
                  <span className="text-[0.8125rem] text-ink/45">
                    {durationLabel(service.durationMin, service.durationMax)}
                  </span>
                  <span className="tabular min-w-[7rem] text-right text-[0.9375rem] text-ink">
                    {priceLabel(service.price, service.priceFrom)}
                  </span>
                  <ArrowUpRight className="hidden size-4 shrink-0 self-center text-ink/20 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-champagne sm:block"/>
                </div>
              </div>

              <p className="mt-2.5 max-w-[52ch] text-[0.875rem] leading-relaxed text-ink/45">
                {service.summary}
              </p>
            </Link>))}
        </div>
      </div>
    </div>);
}
