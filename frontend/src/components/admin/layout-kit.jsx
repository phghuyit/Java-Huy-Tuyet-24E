import * as React from "react";
import { cn } from "@/lib/utils";
export function AdminPage({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}) {
  return (
    <div className={cn("px-4 py-6 md:px-8 md:py-8", className)}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="eyebrow mb-3 text-champagne">{eyebrow}</p>
          ) : null}
          <h2 className="font-display text-[2.25rem] leading-none tracking-tight md:text-[2.75rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-[60ch] text-[0.875rem] leading-relaxed text-paper/40">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
  dense,
}) {
  return (
    <section className={cn("border border-paper/10", className)}>
      {title ? (
        <header className="flex items-center justify-between gap-4 border-b border-paper/10 px-5 py-3.5">
          <h3 className="eyebrow text-paper/45">{title}</h3>
          {action}
        </header>
      ) : null}
      <div className={cn(dense ? "" : "p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
export function SubHeading({ children, className }) {
  return <h3 className={cn("eyebrow text-paper/40", className)}>{children}</h3>;
}
