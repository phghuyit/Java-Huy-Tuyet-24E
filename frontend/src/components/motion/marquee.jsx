import * as React from "react";
import { cn } from "@/lib/utils";
export function Marquee({ items, separator = "•", className, itemClassName, slow = false, reverse = false, }) {
    const track = (<ul aria-hidden className="flex shrink-0 items-center">
      {items.map((item, i) => (<li key={i} className={cn("flex items-center", itemClassName)}>
          <span>{item}</span>
          <span className="mx-[0.9em] text-champagne/70" aria-hidden>
            {separator}
          </span>
        </li>))}
    </ul>);
    return (<div className={cn("mask-fade-x overflow-hidden", className)}>
      <div className={cn("flex w-max", slow ? "animate-marquee-slow" : "animate-marquee", reverse && "[animation-direction:reverse]")}>
        {track}
        {track}
      </div>
      <span className="sr-only">{items.join(", ")}</span>
    </div>);
}
