"use client";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
const EASE = [0.22, 1, 0.36, 1];
const variants = {
    hidden: (d) => ({
        opacity: 0,
        y: d === "up" ? 24 : d === "down" ? -24 : 0,
        x: d === "left" ? 24 : d === "right" ? -24 : 0,
    }),
    show: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: { duration: 0.85, ease: EASE },
    },
};
export function Reveal({ children, delay = 0, direction = "up", className, once = true, as = "div", }) {
    const reduced = useReducedMotion();
    const MotionTag = motion[as];
    if (reduced)
        return <MotionTag className={className}>{children}</MotionTag>;
    return (<MotionTag className={className} custom={direction} variants={variants} initial="hidden" whileInView="show" viewport={{ once, margin: "-10% 0px" }} transition={{ delay }}>
      {children}
    </MotionTag>);
}
export function RevealGroup({ children, className, stagger = 0.08, delay = 0, as = "div", }) {
    const reduced = useReducedMotion();
    const MotionTag = motion[as];
    if (reduced)
        return <MotionTag className={className}>{children}</MotionTag>;
    return (<MotionTag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8% 0px" }} variants={{
            hidden: {},
            show: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}>
      {children}
    </MotionTag>);
}
export function RevealItem({ children, className, as = "div", }) {
    const reduced = useReducedMotion();
    const MotionTag = motion[as];
    if (reduced)
        return <MotionTag className={className}>{children}</MotionTag>;
    return (<MotionTag className={className} variants={{
            hidden: { opacity: 0, y: 22 },
            show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
        }}>
      {children}
    </MotionTag>);
}
