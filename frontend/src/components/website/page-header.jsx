import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal } from "@/components/motion/reveal";
export function PageHeader({ crumbs, title, lines, description, aside, size = "d1", className, }) {
    return (<header className={cn("gutter pt-36 md:pt-44 lg:pt-52", className)}>
      {crumbs?.length ? (<Reveal direction="none">
          <nav aria-label="Đường dẫn trang">
            <ol className="flex flex-wrap items-center gap-2">
              {crumbs.map((crumb, i) => (<li key={crumb.label} className="flex items-center gap-2">
                  {i > 0 ? (<ChevronRight className="size-3 text-ink/25" aria-hidden/>) : null}
                  {crumb.href ? (<Link href={crumb.href} className="eyebrow text-ink/40 transition-colors hover:text-ink">
                      {crumb.label}
                    </Link>) : (<span className="eyebrow text-ink/70">{crumb.label}</span>)}
                </li>))}
            </ol>
          </nav>
        </Reveal>) : null}

      <div className="mt-8 grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AnimatedText as="h1" immediate lines={lines ?? (title ? [title] : [])} className={cn("font-display font-light", size === "d1" ? "text-d1" : "text-d2")}/>
        </div>

        {description || aside ? (<div className="lg:col-span-5 lg:pb-3">
            <Reveal delay={0.25}>
              {description ? (<p className="max-w-[46ch] text-[1rem] leading-relaxed text-ink/55">
                  {description}
                </p>) : null}
              {aside ? <div className={description ? "mt-8" : ""}>{aside}</div> : null}
            </Reveal>
          </div>) : null}
      </div>

      <div className="mt-14 h-px w-full bg-ink/12 md:mt-20"/>
    </header>);
}
