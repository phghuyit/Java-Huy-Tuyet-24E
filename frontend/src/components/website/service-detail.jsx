"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, AlertCircle, RefreshCw } from "lucide-react";
import { durationLabel, pad2, priceLabel, slugify } from "@/util";
import { MaskImage } from "@/components/motion/media";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { ArtistCard } from "@/components/website/artist-card";
import { BookingCta } from "@/components/website/booking-cta";
import { PageHeader } from "@/components/website/page-header";
import { SectionTitle } from "@/components/website/section";
import { nailService, categoryService, staffService } from "@/services";
import { staff as defaultStaff } from "@/data/staff";
import { img, PHOTOS } from "@/data/images";

export function ServiceDetail({ slug }) {
  const [service, setService] = React.useState(null);
  const [category, setCategory] = React.useState(null);
  const [artists, setArtists] = React.useState([]);
  const [related, setRelated] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [apiError, setApiError] = React.useState(null);
  const [isNotFound, setIsNotFound] = React.useState(false);

  const fetchServiceData = React.useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    setIsNotFound(false);

    try {
      const [servicesData, categoriesData, staffData] = await Promise.all([
        nailService.getAll(),
        categoryService.getAll().catch(() => []),
        staffService.getAll().catch(() => []),
      ]);

      if (!Array.isArray(servicesData) || servicesData.length === 0) {
        setIsNotFound(true);
        return;
      }

      const catMap = new Map();
      (categoriesData || []).forEach((c) => {
        catMap.set(c.id, {
          id: c.id,
          name: c.name,
          slug: slugify(c.name) || `cat-${c.id}`,
        });
      });

      const matched = servicesData.find((s) => {
        if (String(s.id) === String(slug)) return true;
        const generatedSlug = `${slugify(s.name)}-${s.id}`;
        if (generatedSlug === slug) return true;
        if (slugify(s.name) === slug) return true;
        return false;
      });

      if (!matched) {
        setIsNotFound(true);
        return;
      }

      const currentCategory = catMap.get(matched.categoryId) || {
        id: matched.categoryId,
        name: "Dịch vụ",
        slug: "services",
      };

      let fallbackImg = img(PHOTOS.hair[0], 1800);
      if (currentCategory.slug.includes("nail")) fallbackImg = img(PHOTOS.nails[0], 1800);
      else if (currentCategory.slug.includes("lash") || currentCategory.slug.includes("mi")) fallbackImg = img(PHOTOS.lashes[0], 1800);
      else if (currentCategory.slug.includes("skin") || currentCategory.slug.includes("da")) fallbackImg = img(PHOTOS.facial[0], 1800);
      else if (currentCategory.slug.includes("spa") || currentCategory.slug.includes("dau")) fallbackImg = img(PHOTOS.spa[0], 1800);

      const finalServiceImg = matched.imageUrl && !matched.imageUrl.includes("placeholder") ? matched.imageUrl : fallbackImg;

      const mappedService = {
        id: String(matched.id),
        slug: `${slugify(matched.name)}-${matched.id}`,
        name: matched.name,
        categorySlug: currentCategory.slug,
        summary: matched.description || "Dịch vụ chất lượng cao tại salon VELA.",
        description: matched.description || "Dịch vụ chăm sóc và làm đẹp chuyên sâu tại VELA.",
        durationMin: matched.durationMinutes || 45,
        durationMax: matched.durationMinutes || 45,
        price: matched.price || 0,
        priceFrom: false,
        image: finalServiceImg,
        includes: [
          "Tư vấn kiểu dáng và quy trình phù hợp trước khi làm",
          "Thực hiện với trang thiết bị vô trùng, đạt chuẩn y tế",
          "Sử dụng các sản phẩm chính hãng, an toàn tuyệt đối",
          "Hướng dẫn cách chăm sóc và bảo dưỡng sau dịch vụ",
        ],
        aftercare: [
          "Tuân thủ hướng dẫn chăm sóc từ kỹ thuật viên",
          "Tránh tiếp xúc hóa chất mạnh trong 24 giờ đầu",
          "Đặt lịch dặm hoặc bảo dưỡng định kỳ để duy trì kết quả tốt nhất",
        ],
        active: matched.status !== "INACTIVE",
      };

      const mappedRelated = servicesData
        .filter((s) => s.categoryId === matched.categoryId && s.id !== matched.id && s.status !== "INACTIVE")
        .slice(0, 3)
        .map((s, idx) => ({
          id: String(s.id),
          slug: `${slugify(s.name)}-${s.id}`,
          name: s.name,
          durationMin: s.durationMinutes || 45,
          durationMax: s.durationMinutes || 45,
          price: s.price || 0,
          priceFrom: false,
        }));

      const mappedStaff = (staffData || [])
        .filter((stf) => stf.status !== "INACTIVE")
        .map((stf, idx) => {
          const fallbackPortrait = defaultStaff[idx % defaultStaff.length]?.portrait || img(PHOTOS.portraits[idx % PHOTOS.portraits.length], 1000);
          const finalPortrait = stf.avatarUrl && !stf.avatarUrl.includes("placeholder") ? stf.avatarUrl : fallbackPortrait;
          return {
            id: String(stf.id),
            slug: slugify(stf.fullName || stf.username) || `staff-${stf.id}`,
            name: stf.fullName || stf.username,
            discipline: stf.position || "Kỹ thuật viên VELA",
            role: "Kỹ thuật viên",
            portrait: finalPortrait,
            experienceYears: 5,
          };
        });

      setService(mappedService);
      setCategory(currentCategory);
      setRelated(mappedRelated);
      setArtists(mappedStaff);
    } catch (err) {
      console.error("Failed to load service detail from API:", err);
      setApiError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể kết nối đến máy chủ Backend (http://localhost:8080/api/services). Vui lòng kiểm tra lại dịch vụ Spring Boot."
      );
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    fetchServiceData();
  }, [fetchServiceData]);

  if (isLoading) {
    return (
      <div className="gutter flex min-h-[60vh] flex-col items-center justify-center py-40">
        <div className="size-8 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
        <p className="mt-4 text-[0.9375rem] text-ink/60">Đang tải thông tin dịch vụ từ API máy chủ…</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="gutter flex min-h-[60vh] flex-col items-center justify-center py-40 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-6 font-display text-[2rem] tracking-tight text-ink">Lỗi kết nối API</h2>
        <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink/60">{apiError}</p>
        <button
          onClick={fetchServiceData}
          className="mt-6 inline-flex items-center gap-2 border border-ink/20 px-6 py-3 text-xs tracking-widest uppercase transition-colors hover:border-ink hover:bg-ink hover:text-white"
        >
          <RefreshCw className="size-3.5" /> Thử lại
        </button>
      </div>
    );
  }

  if (isNotFound || !service) {
    notFound();
  }

  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Dịch vụ", href: "/services" },
          { label: service.name },
        ]}
        lines={[service.name]}
        size="d2"
        description={service.summary}
        aside={
          <dl className="flex flex-wrap gap-x-12 gap-y-4">
            <Meta label="Thời lượng" value={durationLabel(service.durationMin, service.durationMax)} />
            <Meta label="Giá" value={priceLabel(service.price, service.priceFrom)} />
            <Meta label="Nhân viên" value={`${artists.length}`} />
          </dl>
        }
      />

      <section className="gutter pt-14 md:pt-20">
        <MaskImage src={service.image} alt={service.name} priority sizes="100vw" className="aspect-[16/9] w-full" />
      </section>

      <section className="gutter grid grid-cols-1 gap-x-16 gap-y-16 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-display text-d4 font-light leading-snug text-ink">{service.description}</p>
          </Reveal>

          <div className="mt-16">
            <h2 className="eyebrow text-ink/40">Dịch vụ bao gồm</h2>
            <RevealGroup className="mt-7 border-t border-ink/12" stagger={0.06}>
              {service.includes.map((item) => (
                <RevealItem key={item}>
                  <div className="flex items-start gap-4 border-b border-ink/12 py-4">
                    <Check className="mt-0.5 size-4 shrink-0 text-champagne" />
                    <span className="text-[0.9375rem] text-ink/75">{item}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          {service.aftercare?.length ? (
            <div className="mt-16">
              <h2 className="eyebrow text-ink/40">Chăm sóc sau dịch vụ</h2>
              <ul className="mt-7 space-y-3">
                {service.aftercare.map((item, i) => (
                  <li key={item} className="flex items-baseline gap-4">
                    <span className="eyebrow tabular shrink-0 text-ink/25">{pad2(i + 1)}</span>
                    <span className="text-[0.9375rem] leading-relaxed text-ink/65">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div className="border border-ink/12 p-7 md:p-9">
              <p className="eyebrow text-champagne">Đặt lịch dịch vụ này</p>

              <p className="mt-6 font-display text-[3rem] leading-none tracking-tight">
                {priceLabel(service.price, service.priceFrom)}
              </p>
              <p className="mt-3 text-[0.875rem] text-ink/50">
                {durationLabel(service.durationMin, service.durationMax)} thực hiện
              </p>

              {artists.length > 0 ? (
                <div className="mt-8 border-t border-ink/12 pt-6">
                  <p className="eyebrow text-ink/40">Kỹ thuật viên phục vụ</p>
                  <ul className="mt-4 space-y-3">
                    {artists.slice(0, 4).map((artist) => (
                      <li key={artist.id} className="group flex items-center gap-3.5">
                        <span className="relative size-10 shrink-0 overflow-hidden bg-nude/30">
                          <Image src={artist.portrait} alt={artist.name} fill sizes="40px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[0.9375rem] font-medium transition-colors group-hover:text-champagne">
                            {artist.name}
                          </span>
                          <span className="block text-[0.75rem] text-ink/45">{artist.discipline}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-9">
                <MagneticButton
                  href={`/booking?service=${service.slug}`}
                  size="cta"
                  className="w-full"
                  disabled={!service.active}
                >
                  {service.active ? "Đặt dịch vụ này" : "Dịch vụ tạm ngừng"}
                </MagneticButton>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {artists.length ? (
        <section className="gutter border-t border-ink/10 py-24 md:py-28">
          <SectionTitle
            eyebrow="Đội ngũ kỹ thuật viên"
            lines={["CHUYÊN VIÊN TẠI VELA"]}
            size="d3"
            link={{ label: "Đặt lịch ngay", href: "/booking" }}
          />
          <RevealGroup className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4" stagger={0.08}>
            {artists.slice(0, 4).map((artist, i) => (
              <RevealItem key={artist.id}>
                <ArtistCard artist={artist} index={i} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {related.length ? (
        <section className="gutter border-t border-ink/10 py-24 md:py-28">
          <SectionTitle eyebrow="Cùng danh mục" lines={["DỊCH VỤ LIÊN QUAN"]} size="d3" />
          <div className="mt-14 border-t border-ink/12">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/services/${item.slug}`}
                className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink/12 py-6"
              >
                <span className="font-display text-[1.75rem] leading-none tracking-tight transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2">
                  {item.name}
                </span>
                <span className="flex items-baseline gap-8 text-[0.875rem] tabular">
                  <span className="text-ink/45">{durationLabel(item.durationMin, item.durationMax)}</span>
                  <span className="text-ink">{priceLabel(item.price, item.priceFrom)}</span>
                  <ArrowUpRight className="size-4 text-ink/20 transition-colors group-hover:text-champagne" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <BookingCta />
    </>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <dt className="eyebrow text-ink/40">{label}</dt>
      <dd className="mt-2 text-[1.125rem] tabular">{value}</dd>
    </div>
  );
}
