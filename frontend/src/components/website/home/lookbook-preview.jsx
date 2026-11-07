"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLookbookEntries } from "@/data";
import { Reveal } from "@/components/motion/reveal";
import { SectionTitle } from "@/components/website/section";
import { lookbookService } from "@/services";

const HEIGHT = [
  "h-[22rem] md:h-[30rem]",
  "h-[18rem] md:h-[24rem] md:mt-14",
  "h-[24rem] md:h-[34rem]",
  "h-[20rem] md:h-[27rem] md:mt-8",
];

export function LookbookPreview() {
  const [items, setItems] = React.useState(() => getLookbookEntries().slice(0, 9));

  React.useEffect(() => {
    let mounted = true;
    lookbookService.getAll().then((data) => {
      if (!mounted || !Array.isArray(data) || data.length === 0) return;
      const mapped = data.slice(0, 9).map((entry) => ({
        id: String(entry.id),
        image: entry.imageUrl || "/images/photo-1632345031435-8727f6897d53.jpg",
        caption: entry.title || "Bộ sưu tập VELA",
        serviceName: "Dịch vụ VELA",
        artistName: "Chuyên viên VELA",
      }));
      setItems(mapped);
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="overflow-hidden py-24 md:py-32 lg:py-40">
      <div className="gutter">
        <SectionTitle
          index="05"
          eyebrow="Dấu ấn gần đây"
          lines={["BỘ SƯU TẬP"]}
          link={{ label: "Xem bộ sưu tập", href: "/lookbook" }}
        />
      </div>

      <Reveal className="mt-16">
        <div className="hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:px-10 xl:px-16">
          {items.map((item, i) => (
            <Link
              key={item.id}
              href="/lookbook"
              className={cn(
                "group relative w-[76vw] shrink-0 snap-start overflow-hidden bg-nude/30 sm:w-[42vw] lg:w-[26vw] xl:w-[22vw]",
                HEIGHT[i % HEIGHT.length]
              )}
            >
              <Image
                src={item.image}
                alt={item.caption}
                fill
                sizes="(max-width: 640px) 76vw, (max-width: 1024px) 42vw, 24vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="absolute inset-x-0 bottom-0 translate-y-2 p-5 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-display text-[1.375rem] leading-none text-paper">
                  {item.serviceName}
                </p>
                <p className="eyebrow mt-2 text-champagne">{item.artistName}</p>
              </div>
            </Link>
          ))}

          <Link
            href="/lookbook"
            className="group flex h-[22rem] w-[60vw] shrink-0 snap-start flex-col items-start justify-end border border-ink/15 p-6 transition-colors hover:border-ink sm:w-[30vw] md:h-[30rem] lg:w-[18vw]"
          >
            <ArrowUpRight className="mb-auto size-5 text-ink/30 transition-colors group-hover:text-champagne" />
            <p className="font-display text-[1.75rem] leading-none tracking-tight">
              Xem toàn bộ
              <br />
              {items.length > 0 ? "bộ sưu tập" : ""}
            </p>
            <p className="eyebrow mt-4 text-ink/40">Bộ sưu tập</p>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
