"use client";
import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { pad2 } from "@/lib/format";
import { formatMediumDate } from "@/lib/clock";
import { reviewService } from "@/services";
const EASE = [0.22, 1, 0.36, 1];
const INTERVAL = 7000;
export function Testimonials({ items }) {
    const [live, setLive] = React.useState(null);

    React.useEffect(() => {
        let mounted = true;
        reviewService.getAll()
            .then((data) => {
                if (!mounted || !Array.isArray(data)) return;
                const rows = data
                    .filter(review => (review.published ?? true) && (review.highlighted || review.rating >= 4))
                    .map(review => ({
                        id: String(review.id),
                        body: review.comment || review.body || "",
                        author: review.customerName || review.author || "Khách hàng VELA",
                        meta: [
                            review.serviceName || null,
                            review.createdAt ? formatMediumDate(review.createdAt) : null,
                        ].filter(Boolean).join(" · "),
                    }))
                    .filter(r => Boolean(r.body));
                if (rows.length > 0) {
                    setLive(rows);
                }
            })
            .catch((err) => {
                console.error("Failed to load reviews in Testimonials:", err);
            });
        return () => {
            mounted = false;
        };
    }, []);
    const rows = live ?? items;
    const [index, setIndex] = React.useState(0);
    const [paused, setPaused] = React.useState(false);
    const reduced = useReducedMotion();
    const go = React.useCallback((delta) => setIndex((current) => (current + delta + rows.length) % rows.length), [rows.length]);
    React.useEffect(() => {
        if (paused || reduced || rows.length < 2)
            return;
        const id = window.setInterval(() => go(1), INTERVAL);
        return () => window.clearInterval(id);
    }, [paused, reduced, go, rows.length]);
    const active = rows[index];
    return (<section className="relative overflow-hidden bg-ivory py-24 md:py-32 lg:py-40" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="gutter">
        <div className="flex items-center gap-4 border-t border-ink/12 pt-4">
          <span className="eyebrow tabular text-champagne">05</span>
          <span className="eyebrow text-ink/45">Khách hàng chia sẻ</span>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <span aria-hidden className="block font-display text-[7rem] leading-[0.5] text-champagne/35 md:text-[10rem]">
              &ldquo;
            </span>

            <div className="relative mt-4 min-h-[13rem] md:min-h-[16rem] lg:min-h-[18rem]">
              <AnimatePresence mode="wait">
                <motion.blockquote key={active.id} initial={reduced ? { opacity: 0 } : { opacity: 0, y: 26 }} animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18 }} transition={{ duration: 0.65, ease: EASE }}>
                  <p className="max-w-[20ch] font-display text-d2 font-light leading-[1.02] tracking-tight text-ink md:max-w-[22ch]">
                    {active.body}
                  </p>
                  <footer className="mt-10 flex items-baseline gap-4">
                    <cite className="not-italic text-[1.0625rem] text-ink">
                      — {active.author}
                    </cite>
                    <span className="text-[0.8125rem] text-ink/40">
                      {active.meta}
                    </span>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-end justify-between gap-6 lg:col-span-3 lg:flex-col lg:items-end lg:justify-end">
            <p className="eyebrow tabular text-ink/35">
              {pad2(index + 1)} — {pad2(rows.length)}
            </p>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Đánh giá trước" className="flex size-11 items-center justify-center border border-ink/15 text-ink/50 transition-colors hover:border-ink hover:text-ink">
                <ArrowLeft className="size-4"/>
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Đánh giá tiếp theo" className="flex size-11 items-center justify-center border border-ink/15 text-ink/50 transition-colors hover:border-ink hover:text-ink">
                <ArrowRight className="size-4"/>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-14 flex gap-1.5">
          {rows.map((item, i) => (<button key={item.id} type="button" onClick={() => setIndex(i)} aria-label={`Show testimonial ${i + 1}`} className="group h-6 flex-1">
              <span className="relative block h-px w-full bg-ink/15">
                <motion.span className="absolute inset-y-0 left-0 bg-ink" initial={false} animate={{ scaleX: i === index ? 1 : 0 }} style={{ originX: 0, width: "100%" }} transition={i === index && !paused && !reduced
                ? { duration: INTERVAL / 1000, ease: "linear" }
                : { duration: 0.3 }}/>
              </span>
            </button>))}
        </div>
      </div>
    </section>);
}
