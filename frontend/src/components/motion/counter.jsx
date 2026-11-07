"use client";
import * as React from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
export function Counter({ value, duration = 0.9, decimals = 0, prefix = "", suffix = "", className, }) {
    const ref = React.useRef(null);
    const inView = useInView(ref, { once: true, margin: "-10% 0px" });
    const reduced = useReducedMotion();
    const format = React.useCallback((n) => `${prefix}${n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}${suffix}`, [prefix, suffix, decimals]);
    React.useEffect(() => {
        const node = ref.current;
        if (!node)
            return;
        if (reduced || !inView) {
            if (reduced)
                node.textContent = format(value);
            return;
        }
        const controls = animate(0, value, {
            duration,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (latest) => {
                node.textContent = format(latest);
            },
        });
        return () => controls.stop();
    }, [inView, value, duration, reduced, format]);
    return (<span ref={ref} className={className} suppressHydrationWarning>
      {format(reduced ? value : 0)}
    </span>);
}
