"use client";
import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { durationLabel, pad2, priceLabel, slugify } from "@/util";
import { BookingCta } from "@/components/website/booking-cta";
import { PageHeader } from "@/components/website/page-header";
import { ServiceExplorer } from "@/components/website/service-explorer";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionTitle } from "@/components/website/section";
import { nailService, categoryService } from "@/services";
import { AlertCircle, RefreshCw } from "lucide-react";
import { img, PHOTOS } from "@/data/images";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function ServicesCatalogue({ initialCategory }) {
    const [apiServices, setApiServices] = React.useState([]);
    const [apiCategories, setApiCategories] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [apiError, setApiError] = React.useState(null);

    const loadData = React.useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const [servicesData, categoriesData] = await Promise.all([
                nailService.getAll(),
                categoryService.getAll().catch(() => [])
            ]);

            if (Array.isArray(servicesData) && servicesData.length > 0) {
                const catMap = new Map();
                const mappedCategories = (categoriesData || []).map((c, i) => {
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
                        active: c.status !== "INACTIVE"
                    };
                });

                if (mappedCategories.length === 0) {
                    mappedCategories.push({
                        id: "cat-general",
                        slug: "general",
                        name: "Dịch vụ chung",
                        headline: "DỊCH VỤ",
                        summary: "Tất cả dịch vụ",
                        description: "Dịch vụ làm đẹp tại salon.",
                        image: img(PHOTOS.interior[0], 1800),
                        order: 1,
                        active: true
                    });
                }

                const defaultCatSlug = mappedCategories[0].slug;

                const mappedServices = servicesData.map((s, i) => {
                    const catSlug = catMap.get(s.categoryId) || defaultCatSlug;
                    let fallbackImg = img(PHOTOS.hair[i % PHOTOS.hair.length], 1600);
                    if (catSlug.includes("nail")) fallbackImg = img(PHOTOS.nails[i % PHOTOS.nails.length], 1600);
                    else if (catSlug.includes("lash") || catSlug.includes("mi")) fallbackImg = img(PHOTOS.lashes[i % PHOTOS.lashes.length], 1600);
                    else if (catSlug.includes("skin") || catSlug.includes("da")) fallbackImg = img(PHOTOS.facial[i % PHOTOS.facial.length], 1600);
                    else if (catSlug.includes("spa") || catSlug.includes("dau")) fallbackImg = img(PHOTOS.spa[i % PHOTOS.spa.length], 1600);

                    const finalImg = s.imageUrl && !s.imageUrl.includes("placeholder") ? s.imageUrl : fallbackImg;

                    return {
                        id: String(s.id),
                        slug: `${slugify(s.name)}-${s.id}`,
                        name: s.name,
                        categorySlug: catSlug,
                        summary: s.description || "Dịch vụ chất lượng cao.",
                        description: s.description || "",
                        durationMin: s.durationMinutes || 45,
                        durationMax: s.durationMinutes || 45,
                        price: s.price || 0,
                        priceFrom: false,
                        image: finalImg,
                        includes: [],
                        aftercare: [],
                        active: s.status !== "INACTIVE",
                        featured: false,
                        signature: false,
                        order: i + 1
                    };
                });

                setApiCategories(mappedCategories);
                setApiServices(mappedServices);
            } else {
                setApiServices([]);
                setApiCategories([]);
            }
        } catch (err) {
            console.error("Backend API Error:", err);
            setApiError(
                err?.response?.data?.message ||
                err?.message ||
                "Không thể kết nối đến máy chủ Backend (http://localhost:8080/api/services). Vui lòng đảm bảo Spring Boot backend đang chạy."
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    if (isLoading) {
        return (
            <div className="gutter flex min-h-[60vh] flex-col items-center justify-center py-40">
                <div className="size-8 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
                <p className="mt-4 text-[0.9375rem] text-ink/60">Đang tải danh sách dịch vụ từ API máy chủ…</p>
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
                    onClick={loadData}
                    className="mt-6 inline-flex items-center gap-2 border border-ink/20 px-6 py-3 text-xs tracking-widest uppercase transition-colors hover:border-ink hover:bg-ink hover:text-white"
                >
                    <RefreshCw className="size-3.5" /> Thử lại
                </button>
            </div>
        );
    }

    const services = apiServices.filter(s => s.active);
    const categories = apiCategories.filter(c => c.active);
    const getServicesByCategory = (slug) => services.filter(s => s.categorySlug === slug);

    return (<>
      <PageHeader crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Dịch vụ" }]} lines={["KHÁM PHÁ", "DỊCH VỤ VELA."]} description="Khám phá dịch vụ và giá tại VELA. Mỗi buổi hẹn đều bắt đầu bằng trao đổi với chuyên viên để hiểu mong muốn của bạn." aside={<div className="space-y-4">
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              <Figure value={`${services.length}`} label="Dịch vụ"/>
              <Figure value={`${categories.length}`} label="Danh mục"/>
              <Figure value="45–210" label="Phút"/>
            </dl>
          </div>}/>

      <section className="gutter py-20 md:py-24">
        <ServiceExplorer categories={categories} services={services} initialCategory={initialCategory}/>
      </section>

      <section className="gutter border-t border-ink/10 py-24 md:py-32">
        <SectionTitle index="—" eyebrow="Toàn bộ dịch vụ" lines={["CHĂM SÓC,", "THEO TỪNG NHU CẦU."]} size="d2"/>

        <div className="mt-20 space-y-20">
          {categories.map((category, ci) => {
            const list = getServicesByCategory(category.slug);
            return (<div key={category.id} className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
                <div className="lg:col-span-3">
                  <Reveal>
                    <p className="eyebrow text-champagne">{pad2(ci + 1)}</p>
                    <h3 className="mt-4 font-display text-[2.25rem] leading-none tracking-tight">
                      {category.name}
                    </h3>
                    <p className="mt-4 max-w-[30ch] text-[0.875rem] leading-relaxed text-ink/45">
                      {category.summary}
                    </p>
                  </Reveal>
                </div>

                <RevealGroup className="lg:col-span-9" stagger={0.05}>
                  <div className="border-t border-ink/12">
                    {list.length === 0 ? (
                      <p className="py-6 text-sm text-ink/40">Chưa có dịch vụ nào trong danh mục này.</p>
                    ) : (
                      list.map((service) => (<RevealItem key={service.id}>
                        <div className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink/12 py-5">
                          <span className="flex min-w-0 items-baseline gap-3">
                            <span className="text-[1.0625rem] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                              {service.name}
                            </span>
                            {service.signature ? (<span className="eyebrow text-champagne">
                                Đặc trưng
                              </span>) : null}
                          </span>
                          <span className="flex items-baseline gap-8 text-[0.875rem] tabular">
                            <span className="text-ink/45">
                              {durationLabel(service.durationMin, service.durationMax)}
                            </span>
                            <span className="w-24 text-right text-ink">
                              {priceLabel(service.price, service.priceFrom)}
                            </span>
                            <ArrowUpRight className="size-4 text-ink/20 transition-colors group-hover:text-champagne"/>
                          </span>
                        </div>
                      </RevealItem>))
                    )}
                  </div>
                </RevealGroup>
              </div>);
        })}
        </div>
      </section>

      <BookingCta lines={["ĐÃ CHỌN ĐƯỢC?", "ĐẶT LỊCH CÙNG VELA."]}/>
    </>);
}
function Figure({ value, label }) {
    return (<div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-display text-[1.75rem] leading-none">
          {value}
        </span>
        <span className="eyebrow mt-2 block text-ink/40">{label}</span>
      </dd>
    </div>);
}
