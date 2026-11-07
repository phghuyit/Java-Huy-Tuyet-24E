"use client";
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LookbookGrid } from "@/components/website/lookbook-grid";
import { lookbookService } from "@/services";

const ASPECTS = ["portrait", "tall", "square", "landscape"];

export function LookbookBrowser({ entries: defaultEntries, filters: defaultFilters }) {
  const [active, setActive] = React.useState("all");
  const [entries, setEntries] = React.useState(defaultEntries);
  const [filters, setFilters] = React.useState(defaultFilters);

  React.useEffect(() => {
    let mounted = true;
    lookbookService.getAll().then((data) => {
      if (!mounted || !Array.isArray(data) || data.length === 0) return;
      const mapped = data.map((item, idx) => ({
        id: String(item.id),
        image: item.imageUrl || "/images/photo-1632345031435-8727f6897d53.jpg",
        caption: item.title || item.description || "Bộ sưu tập VELA",
        aspect: ASPECTS[idx % ASPECTS.length],
        beforeAfter: idx % 3 === 0,
        featured: true,
        categorySlug: item.categorySlug || "nails",
        categoryLabel: item.categorySlug === "nails" ? "Làm móng" : item.categorySlug === "lashes" ? "Nối mi" : "Spa thư giãn",
        serviceName: "Dịch vụ VELA",
        artistName: "Chuyên viên VELA",
      }));

      setEntries(mapped);

      const updatedFilters = defaultFilters.map((f) => ({
        ...f,
        count: f.value === "all" ? mapped.length : mapped.filter((e) => e.categorySlug === f.value).length,
      }));
      setFilters(updatedFilters);
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, [defaultFilters]);

  const visible = React.useMemo(
    () => (active === "all" ? entries : entries.filter((entry) => entry.categorySlug === active)),
    [entries, active]
  );

  return (
    <section className="gutter py-16 md:py-20">
      <div className="hide-scrollbar -mx-5 flex gap-8 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
        {filters.map((filter) => {
          const isActive = filter.value === active;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActive(filter.value)}
              aria-pressed={isActive}
              className="group relative shrink-0 pb-3"
            >
              <span className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "font-display text-[1.75rem] leading-none tracking-tight transition-colors duration-300 md:text-[2.25rem]",
                    isActive ? "text-ink" : "text-ink/30 group-hover:text-ink/60"
                  )}
                >
                  {filter.label}
                </span>
                <span
                  className={cn(
                    "eyebrow tabular transition-colors duration-300",
                    isActive ? "text-champagne" : "text-ink/25"
                  )}
                >
                  {filter.count}
                </span>
              </span>
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-px w-full origin-left bg-ink transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isActive ? "scale-x-100" : "scale-x-0"
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-12 border-t border-ink/12 pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <LookbookGrid items={visible} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
