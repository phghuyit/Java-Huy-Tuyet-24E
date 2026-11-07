"use client";
import * as React from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, } from "motion/react";
import { cn } from "@/lib/utils";
const EASE = [0.22, 1, 0.36, 1];
export function MaskImage({ src, alt, className, imageClassName, priority, sizes = "(max-width: 768px) 100vw, 50vw", delay = 0, immediate = false, direction = "up", }) {
    const reduced = useReducedMotion();
    const hidden = direction === "up"
        ? { clipPath: "inset(100% 0% 0% 0%)" }
        : { clipPath: "inset(0% 100% 0% 0%)" };
    if (reduced) {
        return (<div className={cn("relative overflow-hidden", className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imageClassName)}/>
      </div>);
    }
    return (<motion.div className={cn("relative overflow-hidden", className)} initial={hidden} {...(immediate
        ? { animate: { clipPath: "inset(0% 0% 0% 0%)" } }
        : {
            whileInView: { clipPath: "inset(0% 0% 0% 0%)" },
            viewport: { once: true, margin: "-10% 0px" },
        })} transition={{ duration: 1.25, ease: EASE, delay }}>
      <motion.div className="absolute inset-0" initial={{ scale: 1.16 }} {...(immediate
        ? { animate: { scale: 1 } }
        : {
            whileInView: { scale: 1 },
            viewport: { once: true, margin: "-10% 0px" },
        })} transition={{ duration: 1.6, ease: EASE, delay }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", imageClassName)}/>
      </motion.div>
    </motion.div>);
}
export function Parallax({ children, distance = 60, className, }) {
    const ref = React.useRef(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const raw = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2]);
    const y = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.5 });
    return (<div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>);
}
export function ScrollScale({ children, from = 0.94, to = 1, className, }) {
    const ref = React.useRef(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const scale = useTransform(scrollYProgress, [0, 0.6], [from, to]);
    return (<div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { scale }} className="h-full w-full origin-center">
        {children}
      </motion.div>
    </div>);
}
export function HoverImage({ className, imageClassName, ...props }) {
    return (<div className={cn("relative overflow-hidden", className)}>
      <Image {...props} alt={props.alt} className={cn("object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]", imageClassName)}/>
    </div>);
}
