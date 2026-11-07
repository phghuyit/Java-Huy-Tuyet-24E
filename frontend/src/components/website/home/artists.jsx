"use client";
import * as React from "react";
import { staffService } from "@/services";
import { cn } from "@/lib/utils";
import { slugify } from "@/util";
import { ArtistCard } from "@/components/website/artist-card";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Section, SectionTitle } from "@/components/website/section";

const OFFSET = ["", "lg:mt-16", "lg:mt-6", "lg:mt-24"];

const DEFAULT_PORTRAITS = [
  "/images/photo-1533933269825-da140ad3132f.jpg",
  "/images/photo-1506863530036-1efeddceb993.jpg",
  "/images/photo-1611451444023-7fe9d86fe1d0.jpg",
  "/images/photo-1636153279424-cb5d1e00f5a2.jpg",
];

export function Artists() {
  const [artists, setArtists] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    staffService.getAll()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const mapped = data
          .filter((s) => s.status !== "INACTIVE")
          .map((s, idx) => ({
            id: String(s.id),
            slug: slugify(s.fullName || s.username || s.name) || `staff-${s.id}`,
            name: s.fullName || s.username || s.name || `Chuyên viên ${s.id}`,
            role: s.role === "ADMIN" ? "Quản lý" : "Kỹ thuật viên",
            discipline: s.position || "Chăm sóc & Tạo mẫu móng",
            experienceYears: 2 + (idx % 4),
            portrait: (s.avatarUrl && !s.avatarUrl.includes("placeholder"))
              ? s.avatarUrl
              : DEFAULT_PORTRAITS[idx % DEFAULT_PORTRAITS.length],
            active: s.status === "ACTIVE",
          }));
        setArtists(mapped);
      })
      .catch((err) => {
        console.error("Failed to load staff from backend API:", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (artists.length === 0) return null;

  return (
    <Section>
      <div className="gutter">
        <SectionTitle
          index="04"
          eyebrow="Đội ngũ VELA"
          lines={["GẶP GỠ", "CHUYÊN VIÊN"]}
          link={{ label: "Tất cả nhân viên", href: "/artists" }}
          description="Mỗi chuyên viên đều có thế mạnh riêng. Tìm hiểu hồ sơ và chọn người bạn muốn đồng hành trong buổi hẹn."
        />

        <RevealGroup
          className="mt-20 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.1}
        >
          {artists.map((artist, i) => (
            <RevealItem
              key={artist.id}
              className={cn(OFFSET[i % OFFSET.length])}
            >
              <ArtistCard artist={artist} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
