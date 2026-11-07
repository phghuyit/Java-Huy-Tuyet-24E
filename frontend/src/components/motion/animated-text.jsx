"use client";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
const EASE = [0.22, 1, 0.36, 1];
const container = {
    hidden: {},
    show: (stagger) => ({
        transition: { staggerChildren: stagger, delayChildren: 0.05 },
    }),
};
const maskedChild = {
    hidden: { y: "110%" },
    show: { y: "0%", transition: { duration: 0.9, ease: EASE } },
};
const softChild = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
export function AnimatedText({ lines, text, as: Tag = "span", className, lineClassName, stagger, delay = 0, immediate = false, }) {
    const reduced = useReducedMotion();
    const MotionTag = motion[Tag];
    const items = lines ?? text?.split(" ") ?? [];
    const masked = Boolean(lines);
    const step = stagger ?? (masked ? 0.09 : 0.018);
    if (reduced) {
        return (<Tag className={className}>
        {masked
                ? items.map((line, i) => (<span key={i} className={cn("block", lineClassName)}>
                {line}
              </span>))
                : items.join(" ")}
      </Tag>);
    }
    return (<MotionTag className={className} custom={step} variants={container} initial="hidden" {...(immediate
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, margin: "-12% 0px" } })} transition={{ delayChildren: delay }}>
      {items.map((item, i) => masked ? (<span key={i} className={cn("block overflow-hidden py-[0.12em] -my-[0.12em]", lineClassName)}>
            <motion.span variants={maskedChild} className="block will-change-transform">
              {item}
            </motion.span>
          </span>) : (<motion.span key={i} variants={softChild} className="inline-block">
            {item}
            {i < items.length - 1 ? " " : ""}
          </motion.span>))}
    </MotionTag>);
}
