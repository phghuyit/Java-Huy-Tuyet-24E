"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepArtist({
  artists: propArtists,
  staff,
  value: propValue,
  selected,
  onChange: propOnChange,
  onSelect,
  unavailable = [],
}) {
  const artists = propArtists || staff || [];
  const value = propValue !== undefined ? propValue : selected;
  const onChange = propOnChange || onSelect || (() => {});
  const safeUnavailable = Array.isArray(unavailable) ? unavailable : [];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {artists.map((artist, i) => {
        const isSelected = value === artist.id;
        const blocked = safeUnavailable.includes(artist.id);
        const displayName = artist.name || "Kỹ thuật viên";
        const firstName = displayName.split(" ")[0] || displayName;
        const fallbackPortraits = [
          "/images/photo-1533933269825-da140ad3132f.jpg",
          "/images/photo-1506863530036-1efeddceb993.jpg",
          "/images/photo-1611451444023-7fe9d86fe1d0.jpg",
          "/images/photo-1636153279424-cb5d1e00f5a2.jpg",
          "/images/photo-1667053508464-eb11b394df83.jpg",
        ];
        const portraitUrl = (artist.portrait && !artist.portrait.includes("placeholder"))
          ? artist.portrait
          : fallbackPortraits[i % fallbackPortraits.length];

        return (
          <motion.button
            key={artist.id}
            type="button"
            disabled={blocked}
            onClick={() => onChange(artist.id)}
            aria-pressed={isSelected}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.06,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "group relative aspect-[3/4] overflow-hidden text-left lg:aspect-[2/3]",
              blocked && "cursor-not-allowed",
              isSelected &&
                "ring-1 ring-champagne ring-offset-2 ring-offset-ivory",
            )}
          >
            <Image
              src={portraitUrl}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className={cn(
                "object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                blocked
                  ? "grayscale opacity-40"
                  : isSelected
                    ? "scale-[1.03]"
                    : "group-hover:scale-[1.03]",
              )}
            />
            <div
              className={cn(
                "absolute inset-0 transition-colors duration-500",
                isSelected
                  ? "bg-void/45"
                  : "bg-gradient-to-t from-void/90 via-void/35 to-transparent",
              )}
            />

            {isSelected ? (
              <span className="absolute right-3 top-3 flex size-6 items-center justify-center bg-champagne text-void shadow-md">
                <Check className="size-3.5" />
              </span>
            ) : null}

            {artist.experienceYears ? (
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded bg-void/65 px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-champagne backdrop-blur-sm border border-champagne/30">
                ★ {artist.experienceYears}+ năm KN
              </span>
            ) : null}

            <span className="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5">
              <span className="block font-display text-[1.25rem] sm:text-[1.375rem] leading-tight tracking-tight text-paper">
                {displayName}
              </span>
              <span className="mt-1 block text-[0.75rem] font-medium text-champagne/90">
                {artist.discipline || "Chuyên viên móng cao cấp"}
              </span>
              {artist.specialties && artist.specialties.length > 0 && (
                <span className="mt-1.5 block text-[0.6875rem] leading-snug text-paper/70 font-light line-clamp-2">
                  <span className="text-paper/40 font-normal">Thế mạnh:</span>{" "}
                  {artist.specialties.slice(0, 2).join(" · ")}
                </span>
              )}
            </span>
          </motion.button>
        );
      })}

      <motion.button
        type="button"
        onClick={() => onChange("any")}
        aria-pressed={value === "any"}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: artists.length * 0.06,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "group relative col-span-2 flex aspect-auto flex-col justify-between border p-5 text-left transition-colors duration-200 lg:col-span-1 lg:aspect-[2/3]",
          value === "any"
            ? "border-champagne bg-champagne/10"
            : "border-ink/15 hover:border-ink",
        )}
      >
        <Sparkles
          className={cn(
            "size-5 transition-colors",
            value === "any" ? "text-champagne" : "text-ink/25",
          )}
        />
        <span className="mt-6 block">
          <span className="block font-display text-[1.5rem] leading-none tracking-tight md:text-[1.75rem]">
            Để VELA chọn
          </span>
          <span className="mt-1 block text-[0.75rem] font-medium text-champagne">
            Ghép chuyên viên tự động
          </span>
          <span className="mt-2 block text-[0.75rem] leading-relaxed text-ink/60">
            Hệ thống sắp xếp kỹ thuật viên còn trống trọn vẹn khung giờ bạn chọn
          </span>
        </span>
      </motion.button>
    </div>
  );
}
