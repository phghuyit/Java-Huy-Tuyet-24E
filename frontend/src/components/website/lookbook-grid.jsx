"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
const ASPECT = {
    portrait: "aspect-[3/4]",
    tall: "aspect-[2/3]",
    square: "aspect-square",
    landscape: "aspect-[4/3]",
};
export function LookbookGrid({ items, columns = "lg:columns-3", className, }) {
    const [openIndex, setOpenIndex] = React.useState(null);
    const close = React.useCallback(() => setOpenIndex(null), []);
    const step = React.useCallback((delta) => setOpenIndex((current) => current === null ? null : (current + delta + items.length) % items.length), [items.length]);
    React.useEffect(() => {
        if (openIndex === null)
            return;
        const onKey = (event) => {
            if (event.key === "Escape")
                close();
            if (event.key === "ArrowRight")
                step(1);
            if (event.key === "ArrowLeft")
                step(-1);
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [openIndex, close, step]);
    const active = openIndex === null ? null : items[openIndex];
    return (<>
      <div className={cn("columns-1 gap-5 sm:columns-2", columns, className)}>
        {items.map((item, i) => (<button key={item.id} type="button" onClick={() => setOpenIndex(i)} className="group mb-5 block w-full break-inside-avoid text-left">
            <figure className={cn("relative w-full overflow-hidden bg-nude/30", ASPECT[item.aspect])}>
              <Image src={item.image} alt={item.caption} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"/>

              <div className="absolute inset-0 bg-void/0 transition-colors duration-500 group-hover:bg-void/35"/>

              {item.beforeAfter ? (<span className="eyebrow absolute left-4 top-4 border border-paper/40 bg-void/30 px-2 py-1 text-paper backdrop-blur-sm">

                  Diện mạo mới
                </span>) : null}

              <figcaption className="absolute inset-x-0 bottom-0 translate-y-3 p-5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-display text-[1.5rem] leading-none text-paper">
                  {item.serviceName}
                </p>
                <p className="eyebrow mt-2.5 text-champagne">{item.artistName}</p>
              </figcaption>
            </figure>
          </button>))}
      </div>

      <AnimatePresence>
        {active ? (<motion.div key="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-[60] flex flex-col bg-void/96 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={active.caption}>
            <div className="flex items-center justify-between px-5 py-5 md:px-10">
              <p className="eyebrow text-paper/45 tabular">
                {String((openIndex ?? 0) + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")}
              </p>
              <button type="button" onClick={close} aria-label="Đóng" className="p-1 text-paper/60 transition-colors hover:text-paper">
                <X className="size-5"/>
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-5 pb-6 md:px-16">
              <AnimatePresence mode="wait">
                <motion.div key={active.id} initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.995 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="relative h-full w-full">
                  <Image src={active.image} alt={active.caption} fill sizes="100vw" className="object-contain"/>
                </motion.div>
              </AnimatePresence>

              <button type="button" onClick={() => step(-1)} aria-label="Ảnh trước" className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-paper/20 text-paper/70 transition-colors hover:border-paper hover:text-paper md:left-4">
                <ArrowLeft className="size-4"/>
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Ảnh tiếp theo" className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center border border-paper/20 text-paper/70 transition-colors hover:border-paper hover:text-paper md:right-4">
                <ArrowRight className="size-4"/>
              </button>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-paper/10 px-5 py-6 md:px-10">
              <div>
                <p className="font-display text-[1.75rem] leading-none text-paper">
                  {active.serviceName}
                </p>
                <p className="mt-2.5 text-[0.875rem] text-paper/50">
                  {active.caption}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="eyebrow text-paper/35">Nhân viên</p>
                  <p className="mt-1.5 text-[0.9375rem] text-paper/80">
                    {active.artistName}
                  </p>
                </div>
                {active.serviceSlug ? (<Link href={`/booking?service=${active.serviceSlug}`} className="eyebrow bg-champagne px-5 py-3.5 text-void transition-colors hover:bg-paper">

                    Đặt lịch diện mạo này
                  </Link>) : null}
              </div>
            </div>
          </motion.div>) : null}
      </AnimatePresence>
    </>);
}
