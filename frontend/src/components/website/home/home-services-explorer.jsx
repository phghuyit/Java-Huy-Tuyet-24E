"use client";
import * as React from "react";
import { ServiceExplorer } from "@/components/website/service-explorer";
import { nailService, categoryService } from "@/services";
import { categories as defaultCategories, getActiveServices } from "@/data";
import { slugify } from "@/util";
import { img, PHOTOS } from "@/data/images";

export function HomeServicesExplorer() {
  const [categories, setCategories] = React.useState(defaultCategories);
  const [services, setServices] = React.useState(getActiveServices);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      nailService.getAll().catch(() => []),
      categoryService.getAll().catch(() => []),
    ]).then(([svcs, cats]) => {
      if (!mounted) return;
      if (Array.isArray(svcs) && svcs.length > 0) {
        const catMap = new Map();
        const mappedCats = (Array.isArray(cats) && cats.length > 0 ? cats : []).map((c, i) => {
          const slug = slugify(c.name) || `cat-${c.id}`;
          catMap.set(c.id, slug);
          let catImg = img(PHOTOS.hair[i % PHOTOS.hair.length], 1800);
          if (slug.includes("nail")) catImg = img(PHOTOS.nails[i % PHOTOS.nails.length], 1800);
          else if (slug.includes("lash") || slug.includes("mi")) catImg = img(PHOTOS.lashes[i % PHOTOS.lashes.length], 1800);
          else if (slug.includes("skin") || slug.includes("da")) catImg = img(PHOTOS.facial[i % PHOTOS.facial.length], 1800);
          else if (slug.includes("spa") || slug.includes("dau")) catImg = img(PHOTOS.spa[i % PHOTOS.spa.length], 1800);

          return {
            id: String(c.id),
            slug,
            name: c.name,
            headline: c.type || "DỊCH VỤ",
            summary: c.description || "",
            description: c.description || "",
            image: catImg,
            order: i + 1,
            active: c.status !== "INACTIVE",
          };
        });

        const mappedSvcs = svcs
          .filter((s) => s.status !== "INACTIVE" && s.active !== false)
          .map((s, idx) => {
            const catSlug = s.category?.slug || catMap.get(s.categoryId) || "general";
            const generatedSlug = `${slugify(s.name)}-${s.id}`;
            const fallbackImg = PHOTOS.nails[idx % PHOTOS.nails.length];
            return {
              id: String(s.id),
              slug: s.slug || generatedSlug,
              name: s.name,
              summary: s.description || "Dịch vụ làm đẹp chất lượng cao tại VELA.",
              description: s.description || "",
              price: Number(s.price) || 0,
              durationMin: s.durationMinutes || 60,
              categorySlug: catSlug,
              image: s.imageUrl && !s.imageUrl.includes("placeholder") ? s.imageUrl : img(fallbackImg, 1200),
              active: true,
            };
          });

        if (mappedCats.length > 0) {
          setCategories(mappedCats);
        }
        if (mappedSvcs.length > 0) {
          setServices(mappedSvcs);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return <ServiceExplorer categories={categories} services={services} />;
}
