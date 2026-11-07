import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal } from "@/components/motion/reveal";
export function SectionTitle({ index, eyebrow, title, lines, description, link, align = "start", tone = "light", className, size = "d2", }) {
    const dark = tone === "dark";
    return (<div className={cn("w-full", className)}>
      {(index || eyebrow) && (<Reveal className="mb-8 flex items-center gap-4 border-t pt-4">
          {index ? (<span className={cn("eyebrow tabular", dark ? "text-champagne" : "text-champagne")}>
              {index}
            </span>) : null}
          {eyebrow ? (<span className={cn("eyebrow", dark ? "text-paper/45" : "text-ink/45")}>
              {eyebrow}
            </span>) : null}
        </Reveal>)}

      <div className={cn("flex flex-col gap-8 md:flex-row md:items-end md:justify-between", align === "center" && "md:flex-col md:items-center md:text-center")}>
        <div className={cn(align === "center" && "flex flex-col items-center")}>
          <AnimatedText as="h2" lines={lines ?? (title ? [title] : [])} className={cn("font-display font-light", size === "d1" && "text-d1", size === "d2" && "text-d2", size === "d3" && "text-d3", dark ? "text-paper" : "text-ink")}/>
          {description ? (<Reveal delay={0.12}>
              <p className={cn("mt-6 max-w-[46ch] text-[1rem] leading-relaxed", align === "center" && "mx-auto text-center", dark ? "text-paper/55" : "text-ink/55")}>
                {description}
              </p>
            </Reveal>) : null}
        </div>

        {link ? (<Reveal delay={0.2} className="shrink-0">
            <Link href={link.href} className={cn("eyebrow group inline-flex items-center gap-2 border-b pb-2 transition-colors", dark
                ? "border-paper/25 text-paper/70 hover:border-champagne hover:text-champagne"
                : "border-ink/25 text-ink/70 hover:border-ink hover:text-ink")}>
              {link.label}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
            </Link>
          </Reveal>) : null}
      </div>
    </div>);
}
export function Section({ children, className, tone = "light", id, }) {
    return (<section id={id} data-tone={tone === "dark" ? "dark" : undefined} className={cn("relative py-24 md:py-32 lg:py-40", tone === "dark" && "bg-void text-paper", tone === "paper" && "bg-paper", className)}>
      {children}
    </section>);
}
