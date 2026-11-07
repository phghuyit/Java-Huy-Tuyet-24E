"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Star } from "lucide-react";
import { durationLabel } from "@/lib/clock";
import { priceLabel } from "@/lib/format";
import { getLookbookForStaff } from "@/data";
import { staff as defaultStaffList } from "@/data/staff";
import { businessHours } from "@/data/site";
import { staffService, nailService, reviewService } from "@/services";
import { slugify } from "@/util";
import { MaskImage } from "@/components/motion/media";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { AnimatedText } from "@/components/motion/animated-text";
import { BookingCta } from "@/components/website/booking-cta";
import { PageHeader } from "@/components/website/page-header";
import { SectionTitle } from "@/components/website/section";

export function ArtistDetail({ slug }) {
    const [loading, setLoading] = React.useState(true);
    const [artist, setArtist] = React.useState(null);
    const [services, setServices] = React.useState([]);
    const [reviews, setReviews] = React.useState([]);

    React.useEffect(() => {
        let mounted = true;
        Promise.allSettled([
            staffService.getAll(),
            nailService.getAll(),
            reviewService.getAll(),
        ]).then(([staffRes, svcRes, revRes]) => {
            if (!mounted) return;
            const staffList = staffRes.status === "fulfilled" && Array.isArray(staffRes.value)
                ? staffRes.value
                : [];
            const svcList = svcRes.status === "fulfilled" && Array.isArray(svcRes.value)
                ? svcRes.value
                : [];
            const revList = revRes.status === "fulfilled" && Array.isArray(revRes.value)
                ? revRes.value
                : [];

            const matchedRaw = staffList.find(
                (s) =>
                    (s.slug === slug) ||
                    (slugify(s.fullName || s.name || s.username) === slug) ||
                    (`staff-${s.id}` === slug)
            );

            if (!matchedRaw) {
                const localStaff = defaultStaffList.find((s) => s.slug === slug);
                if (localStaff) {
                    setArtist(localStaff);
                    setServices(svcList.map(s => ({
                        id: String(s.id),
                        slug: slugify(s.name) || `svc-${s.id}`,
                        name: s.name,
                        price: s.price,
                        durationMin: s.durationMin || 45,
                    })));
                }
                setLoading(false);
                return;
            }

            const localMatch = defaultStaffList.find(
                (item) => item.slug === slug || slugify(item.name) === slugify(matchedRaw.fullName || matchedRaw.name)
            ) || defaultStaffList[0];

            const builtArtist = {
                id: String(matchedRaw.id),
                slug: slug,
                name: matchedRaw.fullName || matchedRaw.name,
                role: matchedRaw.role || localMatch?.role || "Chuyên viên làm đẹp",
                discipline: matchedRaw.specialization || localMatch?.discipline || "Nail Artist",
                bio: matchedRaw.bio || localMatch?.bio || "Chuyên viên tận tâm tại VELA Salon.",
                philosophy: localMatch?.philosophy || "Vẻ đẹp bắt đầu từ sự tỉ mỉ và lắng nghe.",
                experienceYears: matchedRaw.experienceYears || localMatch?.experienceYears || 3,
                specialties: localMatch?.specialties || ["Làm móng nghệ thuật", "Chăm sóc da & móng", "Sơn gel cao cấp"],
                portrait: (matchedRaw.avatarUrl && !matchedRaw.avatarUrl.includes("placeholder"))
                    ? matchedRaw.avatarUrl
                    : (localMatch?.portrait || "/images/photo-1533933269825-da140ad3132f.jpg"),
                instagram: localMatch?.instagram || null,
                active: matchedRaw.status === "ACTIVE" || matchedRaw.active !== false,
                schedule: localMatch?.schedule || {
                    mon: { start: "09:00", end: "18:00" },
                    tue: { start: "09:00", end: "18:00" },
                    wed: { start: "09:00", end: "18:00" },
                    thu: { start: "09:00", end: "18:00" },
                    fri: { start: "09:00", end: "18:00" },
                    sat: { start: "09:00", end: "17:00" },
                    sun: null,
                },
            };

            const mappedServices = svcList
                .filter(s => s.status !== "INACTIVE")
                .map(s => ({
                    id: String(s.id),
                    slug: slugify(s.name) || `svc-${s.id}`,
                    name: s.name,
                    price: s.price,
                    durationMin: s.durationMin || 45,
                }));

            setArtist(builtArtist);
            setServices(mappedServices);

            const staffReviews = revList.filter(
                (r) => String(r.staffId) === String(matchedRaw.id) || r.staffName === matchedRaw.name
            );
            setReviews(staffReviews);
            setLoading(false);
        });

        return () => {
            mounted = false;
        };
    }, [slug]);

    if (loading)
        return <p role="status" className="gutter pt-40 pb-20">Đang tải nhân viên…</p>;
    if (!artist)
        notFound();
    const firstName = artist.name.split(" ")[0];
    const portfolio = getLookbookForStaff(artist.id, 6);
    const reviewCount = reviews.length;
    const averageScore = reviewCount
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewCount).toFixed(1)
        : "5.0";
    return (<>
      <PageHeader crumbs={[
            { label: "Trang chủ", href: "/" },
            { label: "Nhân viên", href: "/artists" },
            { label: firstName },
        ]} lines={[artist.name]} size="d2" description={artist.role + " · " + artist.discipline} aside={<dl className="flex flex-wrap gap-x-12 gap-y-4">
            <Meta label="Kinh nghiệm" value={`${artist.experienceYears} năm`}/>
            <Meta label="Đánh giá" value={reviewCount ? averageScore : "5.0"}/>
            <Meta label="Lượt đánh giá" value={`${reviewCount || 12}`}/>
          </dl>}/>

      <section className="gutter grid grid-cols-1 gap-x-16 gap-y-14 pt-14 md:pt-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <MaskImage immediate priority src={(artist.portrait && !artist.portrait.includes("placeholder")) ? artist.portrait : "/images/photo-1533933269825-da140ad3132f.jpg"} alt={artist.name} sizes="(max-width: 1024px) 100vw, 40vw" className="aspect-[3/4] w-full"/>

          <Reveal delay={0.2} className="mt-8 border-t border-ink/12 pt-6">
            <p className="eyebrow text-ink/40">Chuyên môn</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {artist.specialties.map((item) => (<li key={item} className="border border-ink/15 px-3 py-1.5 text-[0.75rem] text-ink/60">
                  {item}
                </li>))}
            </ul>
            {artist.instagram ? (<p className="mt-6 text-[0.875rem] text-ink/45">
                {artist.instagram}
              </p>) : null}
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <blockquote className="border-l border-champagne pl-6">
              <p className="font-display text-d3 font-light italic leading-snug">
                &ldquo;{artist.philosophy}&rdquo;
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-10 max-w-[56ch] text-[1rem] leading-relaxed text-ink/60">
              {artist.bio}
            </p>
          </Reveal>

          <div className="mt-14">
            <h2 className="eyebrow text-ink/40">Lịch làm việc</h2>
            <RevealGroup className="mt-6 border-t border-ink/12" stagger={0.04}>
              {businessHours.map((entry) => {
            const shift = entry.open ? artist.schedule[entry.day] : null;
            return (<RevealItem key={entry.day}>
                    <div className="flex items-baseline justify-between border-b border-ink/12 py-3.5">
                      <span className="text-[0.9375rem] text-ink/70">
                        {entry.label}
                      </span>
                      <span className={shift
                    ? "text-[0.9375rem] tabular text-ink"
                    : "text-[0.9375rem] text-ink/30"}>
                        {shift ? `${shift.start} — ${shift.end}` : "Nghỉ"}
                      </span>
                    </div>
                  </RevealItem>);
        })}
            </RevealGroup>
          </div>

          <Reveal delay={0.15} className="mt-12">
            <MagneticButton href={`/booking?artist=${artist.slug}`} disabled={!artist.active || !services.length} size="cta">

              {artist.active ? `Đặt lịch với ${firstName}` : "Nhân viên tạm ngừng"}
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      {portfolio.length ? (<section className="gutter border-t border-ink/10 py-24 md:py-28">
          <SectionTitle eyebrow="Tác phẩm chọn lọc" lines={["DẤU ẤN CHUYÊN MÔN"]} size="d3" link={{ label: "Xem bộ sưu tập", href: "/lookbook" }}/>
          <RevealGroup className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-3" stagger={0.07}>
            {portfolio.map((item) => (<RevealItem key={item.id}>
                <Link href="/lookbook" className="group relative block aspect-[4/5] overflow-hidden bg-nude/30">
                  <Image src={item.image} alt={item.caption} fill sizes="(max-width: 768px) 50vw, 32vw" className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"/>
                  <div className="absolute inset-0 bg-void/0 transition-colors duration-500 group-hover:bg-void/25"/>
                  <p className="absolute bottom-0 left-0 right-0 translate-y-2 p-4 text-[0.8125rem] text-paper opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {item.caption}
                  </p>
                </Link>
              </RevealItem>))}
          </RevealGroup>
        </section>) : null}

      <section className="gutter border-t border-ink/10 py-24 md:py-28">
        <SectionTitle eyebrow={`Dịch vụ của ${firstName}`} lines={["DỊCH VỤ PHỤ TRÁCH"]} size="d3"/>
        <div className="mt-14 border-t border-ink/12">
          {services.map((service) => (<Link key={service.id} href={`/booking?service=${service.slug}&artist=${artist.slug}`} className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink/12 py-5">
              <span className="text-[1.0625rem] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5">
                {service.name}
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
            </Link>))}
        </div>
      </section>

      {reviews.length ? (<section className="gutter border-t border-ink/10 py-24 md:py-28">
          <SectionTitle eyebrow="Khách hàng chia sẻ" lines={["VỀ " + firstName.toUpperCase()]} size="d3"/>
          <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2">
            {reviews.map((review) => (<Reveal key={review.id}>
                <div className="border-t border-ink/12 pt-7">
                  <div className="flex items-center gap-1 text-champagne">
                    {Array.from({ length: review.rating }).map((_, i) => (<Star key={i} className="size-3.5 fill-current"/>))}
                  </div>
                  <p className="mt-6 font-display text-[1.5rem] font-light leading-snug">
                    &ldquo;{review.body}&rdquo;
                  </p>
                  <p className="mt-5 text-[0.875rem] text-ink/45">
                    — {review.author}
                  </p>
                  {review.reply ? (<p className="mt-5 border-l border-champagne pl-4 text-[0.875rem] leading-relaxed text-ink/55">
                      <span className="eyebrow block text-champagne">VELA phản hồi</span>
                      <span className="mt-2 block">{review.reply}</span>
                    </p>) : null}
                </div>
              </Reveal>))}
          </div>
        </section>) : null}

      <section className="border-t border-ink/10 bg-void py-24 text-paper md:py-28" data-tone="dark">
        <div className="gutter flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
          <AnimatedText as="h2" lines={["SẴN SÀNG CÙNG", `${firstName.toUpperCase()} IS.`]} className="font-display text-d2 font-light"/>
          <Reveal delay={0.15}>
            <MagneticButton href={`/booking?artist=${artist.slug}`} variant="champagne" size="cta">

              Đặt lịch với {firstName.toUpperCase()}
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <BookingCta />
    </>);
}
function Meta({ label, value }) {
    return (<div>
      <dt className="eyebrow text-ink/40">{label}</dt>
      <dd className="mt-2 text-[1.125rem] tabular">{value}</dd>
    </div>);
}
