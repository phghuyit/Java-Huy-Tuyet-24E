"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
const fieldBase = "w-full border-0 border-b bg-transparent px-0 py-3 text-[0.95rem] outline-none transition-colors duration-200 placeholder:text-ink/30 focus:border-ink " +
    "border-ink/20 text-ink " +
    "[[data-tone=dark]_&]:border-paper/20 [[data-tone=dark]_&]:text-paper [[data-tone=dark]_&]:placeholder:text-paper/30 [[data-tone=dark]_&]:focus:border-champagne";
export const Label = React.forwardRef(({ className, ...props }, ref) => (<LabelPrimitive.Root ref={ref} className={cn("eyebrow block text-ink/45 [[data-tone=dark]_&]:text-paper/40", className)} {...props}/>));
Label.displayName = "Label";
export const Input = React.forwardRef(({ className, ...props }, ref) => (<input ref={ref} className={cn(fieldBase, className)} {...props}/>));
Input.displayName = "Input";
export const Textarea = React.forwardRef(({ className, ...props }, ref) => (<textarea ref={ref} rows={3} className={cn(fieldBase, "resize-none leading-relaxed", className)} {...props}/>));
Textarea.displayName = "Textarea";
export function Field({ label, hint, error, className, children, }) {
    const id = React.useId();
    const descriptionId = `${id}-description`;
    const child = React.isValidElement(children)
        ? React.cloneElement(children, { id: children.props.id ?? id, "aria-describedby": error || hint ? descriptionId : undefined })
        : children;
    return (<div className={cn("space-y-2.5", className)}>
      {label ? <Label htmlFor={React.isValidElement(children) ? children.props.id ?? id : id}>{label}</Label> : null}
      {child}
      {error ? (<p id={descriptionId} role="alert" className="text-[0.75rem] text-signal-stop">{error}</p>) : hint ? (<p id={descriptionId} className="text-[0.75rem] text-ink/40 [[data-tone=dark]_&]:text-paper/35">
          {hint}
        </p>) : null}
    </div>);
}
