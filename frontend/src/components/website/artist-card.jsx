import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pad2 } from "@/lib/format";
export function ArtistCard({ artist, index, className, ratio = "aspect-[3/4]", priority }) {
    const displayName = artist.name || "Chuyên viên VELA";
    const portraitSrc = (artist.portrait && !artist.portrait.includes("placeholder"))
      ? artist.portrait
      : "/images/photo-1533933269825-da140ad3132f.jpg";
    return (
      <article className={cn("group", className)}>
        <Link href={`/artists/${artist.slug}`} className="block">
          <div className={cn("relative w-full overflow-hidden bg-nude/30", ratio)}>
            <Image
              src={portraitSrc}
              alt={displayName}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />

            <div className="absolute inset-0 bg-void/0 transition-colors duration-500 group-hover:bg-void/25" />

            {typeof index === "number" ? (
              <span className="eyebrow absolute left-4 top-4 text-paper/80 mix-blend-difference">
                {pad2(index + 1)}
              </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ivory px-5 py-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0">
              <span className="eyebrow flex items-center justify-between gap-2 text-ink">
                Xem chi tiết
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-[1.625rem] leading-snug tracking-tight">
                {displayName}
              </h3>
              <p className="mt-2 text-[0.8125rem] text-ink/55">{artist.role}</p>
              <p className="text-[0.8125rem] text-ink/40">{artist.discipline}</p>
            </div>
            <p className="eyebrow shrink-0 pt-1 text-ink/35">
              {artist.experienceYears} năm
            </p>
          </div>
        </Link>
      </article>
    );
}
