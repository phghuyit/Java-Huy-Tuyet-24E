import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal } from "@/components/motion/reveal";
export function RouteMessage({ eyebrow, lines, description, actions, footnote, standalone = false, }) {
    return (<section className={cn("gutter flex flex-col justify-center", standalone ? "min-h-dvh py-16" : "min-h-[70vh] pb-24 pt-36 md:pt-44")}>
      {standalone ? (<Link href="/" className="mb-16 font-display text-[1.5rem] leading-none tracking-[-0.02em] transition-opacity hover:opacity-60">
          VELA.
        </Link>) : null}

      <div className="max-w-3xl">
        <p className="eyebrow text-champagne">{eyebrow}</p>

        <AnimatedText as="h1" immediate lines={lines} className="mt-6 font-display text-d2 font-light"/>

        <Reveal delay={0.15}>
          <p className="mt-7 max-w-[52ch] text-[1rem] leading-relaxed text-ink/55">
            {description}
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-x-3 gap-y-4">
            {actions.map((action) => action.primary ? (<Link key={action.href} href={action.href} className="eyebrow group inline-flex items-center gap-2.5 bg-ink px-6 py-4 text-ivory transition-colors duration-200 hover:bg-champagne hover:text-void">
                  {action.label}
                  <ArrowRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"/>
                </Link>) : (<Link key={action.href} href={action.href} className="eyebrow inline-flex items-center gap-2 border-b border-ink/25 pb-2 text-ink/70 transition-colors hover:border-ink hover:text-ink">
                  {action.label}
                </Link>))}
          </div>

          {footnote ? (<div className="mt-12 border-t border-ink/10 pt-6 text-[0.8125rem] text-ink/40">
              {footnote}
            </div>) : null}
        </Reveal>
      </div>
    </section>);
}
