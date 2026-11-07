"use client";
import * as React from "react";
import { nailService } from "@/services";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { durationLabel, pad2, priceLabel, slugify } from "@/util";
import { MaskImage, Parallax } from "@/components/motion/media";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedText } from "@/components/motion/animated-text";
import { Section, SectionTitle } from "@/components/website/section";

const DEFAULT_SERVICE_PHOTOS = [
    "/images/photo-1610992015836-7c249d75782d.jpg",
    "/images/photo-1632345031435-8727f6897d53.jpg",
    "/images/photo-1554519934-e32b1629d9ee.jpg",
    "/images/photo-1567629307995-b9f33097bd30.jpg",
];

export function Signatures() {
    const [signatures, setSignatures] = React.useState([]);

    React.useEffect(() => {
        let mounted = true;
        nailService.getAll()
            .then((data) => {
                if (!mounted || !Array.isArray(data)) return;
                const mapped = data
                    .filter((s) => s.status !== "INACTIVE")
                    .slice(0, 4)
                    .map((s, idx) => ({
                        id: String(s.id),
                        slug: `${slugify(s.name)}-${s.id}`,
                        name: s.name,
                        description: s.description || "Dịch vụ chất lượng cao tại VELA.",
                        durationMin: s.durationMinutes || 45,
                        durationMax: s.durationMinutes || 45,
                        price: s.price || 0,
                        priceFrom: false,
                        image: (s.imageUrl && !s.imageUrl.includes("placeholder"))
                            ? s.imageUrl
                            : DEFAULT_SERVICE_PHOTOS[idx % DEFAULT_SERVICE_PHOTOS.length],
                    }));
                setSignatures(mapped);
            })
            .catch((err) => {
                console.error("Failed to load services from backend API:", err);
            });
        return () => {
            mounted = false;
        };
    }, []);

    if (signatures.length === 0) return null;

    return (<Section tone="dark">
      <div className="gutter">
        <SectionTitle index="03" eyebrow="Dịch vụ đặc trưng" lines={["DẤU ẤN", "VELA"]} tone="dark" description="Những dịch vụ nổi bật, được đội ngũ VELA chăm chút từ tư vấn đến hoàn thiện."/>

        <div className="mt-24 space-y-28 md:space-y-36">
          {signatures.map((service, i) => {
            const flipped = i % 2 === 1;
            const serviceImg = (service.image && !service.image.includes("placeholder"))
              ? service.image
              : "/images/photo-1610992015836-7c249d75782d.jpg";
            return (<article key={service.id} className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <Parallax distance={48} className={cn("lg:col-span-7", flipped && "lg:order-2 lg:col-start-6")}>
                  <MaskImage src={serviceImg} alt={service.name} sizes="(max-width: 1024px) 100vw, 58vw" className="aspect-[4/3] w-full" direction={flipped ? "left" : "up"}/>
                </Parallax>

                <div className={cn("lg:col-span-5", flipped && "lg:order-1 lg:col-start-1 lg:row-start-1")}>
                  <Reveal className="mb-6 flex items-center gap-4">
                    <span className="font-display text-[3.5rem] leading-none text-champagne/35">
                      {pad2(i + 1)}
                    </span>
                    <span className="h-px flex-1 bg-paper/15"/>
                  </Reveal>

                  <AnimatedText as="h3" lines={[service.name]} className="font-display text-d3 font-light"/>

                  <Reveal delay={0.1}>
                    <p className="mt-6 max-w-[44ch] text-[0.9375rem] leading-relaxed text-paper/55">
                      {service.description}
                    </p>
                  </Reveal>

                  <Reveal delay={0.16} className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                    <Meta label="Thời lượng" value={durationLabel(service.durationMin, service.durationMax)}/>
                    <Meta label="Giá" value={priceLabel(service.price, service.priceFrom)}/>
                  </Reveal>

                  <Reveal delay={0.22}>
                    <Link href={`/services/${service.slug}`} className="eyebrow group mt-9 inline-flex items-center gap-2 border-b border-paper/25 pb-2 text-paper/75 transition-colors hover:border-champagne hover:text-champagne">

                      Chi tiết dịch vụ
                      <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
                    </Link>
                  </Reveal>
                </div>
              </article>);
        })}
        </div>
      </div>
    </Section>);
}
function Meta({ label, value }) {
    return (<div>
      <p className="eyebrow text-paper/35">{label}</p>
      <p className="mt-2 text-[1.0625rem] text-paper tabular">{value}</p>
    </div>);
}
