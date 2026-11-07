"use client";
import * as React from "react";
import { staff as defaultStaff } from "@/data/staff";
import { staffService } from "@/services";
import { cn } from "@/lib/utils";
import { ArtistCard } from "@/components/website/artist-card";
import { BookingCta } from "@/components/website/booking-cta";
import { PageHeader } from "@/components/website/page-header";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { slugify } from "@/util";

const OFFSET = ["", "lg:mt-24", "lg:mt-10", "lg:mt-32"];

const DEFAULT_PORTRAITS = [
  "/images/photo-1533933269825-da140ad3132f.jpg",
  "/images/photo-1506863530036-1efeddceb993.jpg",
  "/images/photo-1611451444023-7fe9d86fe1d0.jpg",
  "/images/photo-1636153279424-cb5d1e00f5a2.jpg",
  "/images/photo-1580618672591-eb180b1a973f.jpg",
  "/images/photo-1524504388940-b1c1722653e1.jpg",
];

function formatStaff(s, idx) {
  return {
    id: String(s.id),
    slug: s.slug || slugify(s.fullName || s.username || s.name) || `staff-${s.id}`,
    name: s.fullName || s.username || s.name || `Chuyên viên ${s.id}`,
    role: s.role === "ADMIN" || s.roleCode === "ADMIN" ? "Quản lý" : (s.role || "Kỹ thuật viên"),
    discipline: s.position || s.discipline || "Chăm sóc & Tạo mẫu móng",
    philosophy: s.philosophy || s.bio || "Sự hài lòng và vẻ đẹp của khách hàng là ưu tiên hàng đầu.",
    experienceYears: s.experienceYears || (2 + (idx % 4)),
    specialties: Array.isArray(s.specialties) && s.specialties.length > 0
      ? s.specialties
      : ["Làm móng nghệ thuật", "Sơn gel cao cấp", "Chăm sóc da tay"],
    portrait: (s.avatarUrl && !s.avatarUrl.includes("placeholder"))
      ? s.avatarUrl
      : (s.portrait || DEFAULT_PORTRAITS[idx % DEFAULT_PORTRAITS.length]),
    active: s.status === "ACTIVE" || s.active !== false,
  };
}

export function ArtistsCatalogue() {
  const [artists, setArtists] = React.useState(() =>
    (defaultStaff || []).map((s, idx) => formatStaff(s, idx))
  );

  React.useEffect(() => {
    let mounted = true;
    staffService
      .getAll()
      .then((data) => {
        if (!mounted || !Array.isArray(data) || data.length === 0) return;
        const mapped = data
          .filter((s) => s.status !== "INACTIVE")
          .map((s, idx) => formatStaff(s, idx));
        setArtists(mapped);
      })
      .catch((err) => {
        console.error("Failed to load staff from backend API:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totalYears = artists.reduce((sum, a) => sum + a.experienceYears, 0);
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Trang chủ", href: "/" }, { label: "Nhân viên" }]}
        lines={["NHỮNG NGƯỜI", "LÀM NÊN VELA."]}
        description="Tìm hiểu chuyên môn và lịch làm việc của từng nhân viên, rồi đặt lịch với người phù hợp nhất."
        aside={
          <dl className="flex flex-wrap gap-x-12 gap-y-4">
            <Figure value={`${artists.length}`} label="Nhân viên" />
            <Figure value={`${totalYears}`} label="Tổng năm kinh nghiệm" />
            <Figure value="4,9" label="Đánh giá trung bình" />
          </dl>
        }
      />

      <section className="gutter py-20 md:py-28">
        <RevealGroup
          key={artists.map((a) => a.id).join("-")}
          className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.1}
        >
          {artists.map((artist, i) => (
            <RevealItem key={artist.id} className={cn(OFFSET[i % OFFSET.length])}>
              <ArtistCard artist={artist} index={i} ratio="aspect-[3/4]" priority={i < 2} />
              <div className="mt-6">
                <p className="max-w-[34ch] text-[0.875rem] leading-relaxed text-ink/50">
                  {artist.philosophy}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {artist.specialties.slice(0, 3).map((item) => (
                    <li
                      key={item}
                      className="border border-ink/15 px-2.5 py-1 text-[0.6875rem] uppercase tracking-[0.12em] text-ink/50"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <BookingCta lines={["CHỌN NGƯỜI BẠN TIN.", "VELA LUÔN SẴN SÀNG."]} />
    </>
  );
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
