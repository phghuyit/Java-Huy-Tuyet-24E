"use client";
import * as React from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
export function MagneticButton({ children, href, onClick, className, variant = "solid", size = "cta", strength = 10, withArrow = true, type = "button", disabled, }) {
    const shellRef = React.useRef(null);
    const reduced = useReducedMotion();
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const spring = { stiffness: 220, damping: 18, mass: 0.35 };
    const x = useSpring(mx, spring);
    const y = useSpring(my, spring);
    const labelX = useTransform(x, (v) => v * -0.32);
    const labelY = useTransform(y, (v) => v * -0.32);
    function handleMove(event) {
        if (reduced || !shellRef.current)
            return;
        const rect = shellRef.current.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;
        mx.set(relX * strength * 2);
        my.set(relY * strength * 2);
    }
    function reset() {
        mx.set(0);
        my.set(0);
    }
    const classes = cn(buttonVariants({ variant, size }), "group/mag will-change-transform", className);
    const inner = (<>
      <motion.span style={reduced ? undefined : { x: labelX, y: labelY }} className="pointer-events-none">
        {children}
      </motion.span>
      {withArrow ? (<ArrowRight aria-hidden className="pointer-events-none size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/mag:translate-x-1"/>) : null}
    </>);
    return (<motion.span ref={shellRef} style={reduced ? undefined : { x, y }} className="inline-block" onMouseMove={handleMove} onMouseLeave={reset}>
      {href ? (<Link href={href} className={classes}>
          {inner}
        </Link>) : (<button type={type} onClick={onClick} disabled={disabled} className={classes}>
          {inner}
        </button>)}
    </motion.span>);
}
