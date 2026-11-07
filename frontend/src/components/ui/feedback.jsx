import * as React from "react";
import { cn } from "@/lib/utils";
export function Skeleton({ className, ...props }) {
    return (<div className={cn("relative overflow-hidden bg-ink/8 [[data-tone=dark]_&]:bg-paper/8", className)} {...props}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ink/8 to-transparent [[data-tone=dark]_&]:via-paper/10"/>
    </div>);
}
export function SkeletonText({ lines = 3, className, }) {
    return (<div className={cn("space-y-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (<Skeleton key={i} className="h-3" style={{ width: `${100 - i * 12}%` }}/>))}
    </div>);
}
export function EmptyState({ icon: Icon, title, description, action, className, }) {
    return (<div className={cn("flex flex-col items-center justify-center border border-dashed border-ink/12 px-8 py-16 text-center [[data-tone=dark]_&]:border-paper/12", className)}>
      {Icon ? (<Icon className="mb-5 size-5 text-ink/25 [[data-tone=dark]_&]:text-paper/25"/>) : null}
      <p className="font-display text-[1.5rem] leading-none tracking-tight">
        {title}
      </p>
      {description ? (<p className="mt-3 max-w-xs text-[0.8125rem] leading-relaxed text-ink/45 [[data-tone=dark]_&]:text-paper/40">
          {description}
        </p>) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>);
}
