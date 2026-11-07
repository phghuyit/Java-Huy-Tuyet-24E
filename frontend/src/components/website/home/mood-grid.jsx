"use client";
import * as React from "react";
import { categoryService } from "@/services";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pad2, slugify } from "@/util";
import { siteContent } from "@/data/site";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Section, SectionTitle } from "@/components/website/section";

const CATEGORY_FALLBACK_IMAGES = {
    nail: "/images/photo-1610992015836-7c249d75782d.jpg",
    nails: "/images/photo-1610992015836-7c249d75782d.jpg",
    "lam-nail": "/images/photo-1610992015836-7c249d75782d.jpg",
    "cham-soc-mong": "/images/photo-1610992015836-7c249d75782d.jpg",
    hair: "/images/photo-1554519934-e32b1629d9ee.jpg",
    toc: "/images/photo-1554519934-e32b1629d9ee.jpg",
    "cat-toc": "/images/photo-1554519934-e32b1629d9ee.jpg",
    lashes: "/images/photo-1567629307995-b9f33097bd30.jpg",
    mi: "/images/photo-1567629307995-b9f33097bd30.jpg",
    "noi-mi": "/images/photo-1567629307995-b9f33097bd30.jpg",
    facial: "/images/photo-1693004927824-f2623bbedc8b.jpg",
    da: "/images/photo-1693004927824-f2623bbedc8b.jpg",
    "cham-soc-da": "/images/photo-1693004927824-f2623bbedc8b.jpg",
    spa: "/images/photo-1693578538512-fc66f318c833.jpg",
    "thu-gian": "/images/photo-1693578538512-fc66f318c833.jpg",
    "goi-dau": "/images/photo-1693578538512-fc66f318c833.jpg",
};

const DEFAULT_CATEGORY_IMAGES = [
    "/images/photo-1610992015836-7c249d75782d.jpg",
    "/images/photo-1554519934-e32b1629d9ee.jpg",
    "/images/photo-1567629307995-b9f33097bd30.jpg",
    "/images/photo-1693004927824-f2623bbedc8b.jpg",
    "/images/photo-1693578538512-fc66f318c833.jpg",
    "/images/photo-1632345031435-8727f6897d53.jpg",
];

function getCategoryThumbnail(category, index = 0) {
    if (category.image && !category.image.includes("placeholder")) {
        return category.image;
    }
    const slug = (category.slug || "").toLowerCase();
    const name = (category.name || "").toLowerCase();
    for (const [key, path] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
        if (slug.includes(key) || name.includes(key)) {
            return path;
        }
    }
    return DEFAULT_CATEGORY_IMAGES[index % DEFAULT_CATEGORY_IMAGES.length];
}

const LAYOUT = [
    "lg:col-span-7 aspect-[16/11]",
    "lg:col-span-5 aspect-[3/4] lg:mt-24",
    "lg:col-span-4 aspect-[3/4] lg:-mt-16",
    "lg:col-span-4 aspect-[4/5] lg:mt-14",
    "lg:col-span-4 aspect-[3/4] lg:-mt-4",
];

export function MoodGrid() {
    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
        let mounted = true;
        categoryService.getAll()
            .then((data) => {
                if (!mounted || !Array.isArray(data)) return;
                const mapped = data
                    .filter((c) => c.status !== "INACTIVE")
                    .map((c, i) => {
                        const slug = slugify(c.name) || `cat-${c.id}`;
                        return {
                            id: String(c.id),
                            slug: slug,
                            name: c.name,
                            headline: c.name.toUpperCase(),
                            summary: c.description || "Dịch vụ làm đẹp và chăm sóc cao cấp.",
                            description: c.description || "",
                            image: c.image || c.imageUrl || null,
                            order: i + 1,
                            active: true,
                        };
                    });
                setCategories(mapped);
            })
            .catch((err) => {
                console.error("Failed to load categories from backend API:", err);
            });
        return () => {
            mounted = false;
        };
    }, []);

    if (categories.length === 0) return null;

    return (<Section>
      <div className="gutter">
        <SectionTitle index="01" eyebrow="Chọn điều bạn muốn" lines={siteContent.moodTitle.split(" ").length > 3
            ? ["HÔM NAY BẠN", "MUỐN ĐIỀU GÌ?"]
            : [siteContent.moodTitle]} link={{ label: "Tất cả dịch vụ", href: "/services" }}/>

        <RevealGroup className="mt-20 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-12" stagger={0.1}>
          {categories.map((category, i) => {
            const thumbnail = getCategoryThumbnail(category, i);
            return (
              <RevealItem key={category.id} as="article" className={cn("group", LAYOUT[i % LAYOUT.length])}>
                <Link href={`/services?category=${category.slug}`} className="block h-full">
                  <figure className="relative h-full w-full overflow-hidden bg-nude/30">
                    <Image src={thumbnail} alt={category.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw" className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-void/5 to-transparent"/>

                    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-paper md:p-7">
                      <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                        <p className="eyebrow text-champagne">
                          {pad2(i + 1)} / {category.name.toUpperCase()}
                        </p>
                        <p className="mt-3 font-display text-[2rem] leading-none tracking-tight md:text-[2.5rem]">
                          {category.headline || category.name.toUpperCase()}
                        </p>
                        <p className="mt-2.5 text-[0.8125rem] text-paper/65">
                          {category.summary || category.description || "Dịch vụ làm đẹp & chăm sóc cao cấp"}
                        </p>
                      </div>

                      <span className="flex size-10 shrink-0 translate-y-2 items-center justify-center border border-paper/30 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100">
                        <ArrowUpRight className="size-4"/>
                      </span>
                    </figcaption>
                  </figure>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </Section>);
}
