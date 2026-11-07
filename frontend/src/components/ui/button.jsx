import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap font-medium uppercase transition-[background-color,color,border-color,opacity] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-current focus-visible:ring-offset-transparent", {
    variants: {
        variant: {
            solid: "bg-ink text-ivory hover:bg-champagne hover:text-void",
            outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-ivory",
            ghost: "text-ink/70 hover:text-ink",
            champagne: "bg-champagne text-void hover:bg-ink hover:text-ivory",
            light: "bg-paper text-void hover:bg-champagne",
            outlineLight: "border border-paper/30 text-paper hover:border-paper hover:bg-paper hover:text-void",
            ghostLight: "text-paper/60 hover:text-paper",
            danger: "border border-signal-stop/40 text-signal-stop hover:bg-signal-stop hover:text-paper hover:border-signal-stop",
        },
        size: {
            cta: "h-14 px-8 text-[0.6875rem] tracking-[0.2em]",
            lg: "h-12 px-7 text-[0.6875rem] tracking-[0.18em]",
            md: "h-10 px-5 text-[0.6875rem] tracking-[0.14em]",
            sm: "h-8 px-3.5 text-[0.625rem] tracking-[0.12em]",
            icon: "size-9",
            iconSm: "size-7",
        },
    },
    defaultVariants: { variant: "solid", size: "md" },
});
export const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (<Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}/>);
});
Button.displayName = "Button";
export { buttonVariants };
