"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND, websiteNav } from "@/data/site";
import { useCustomerSession } from "@/lib/customer-session";
const EASE = [0.22, 1, 0.36, 1];
export function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const reduced = useReducedMotion();
    const { customer, isAuthenticated } = useCustomerSession();
    const firstName = customer?.name.trim().split(" ").at(-1) ?? "";
    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    React.useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);
    React.useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);
    return (<>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40">
        <div className={cn("pointer-events-auto mx-auto flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", scrolled
            ? "mt-3 max-w-[min(72rem,calc(100%-1.5rem))] border border-ink/10 bg-paper/72 px-4 py-2.5 backdrop-blur-xl md:px-5"
            : "mt-0 max-w-full border border-transparent px-5 py-6 md:px-10 xl:px-16")}>
          <Link href="/" className="font-display text-[1.5rem] leading-none tracking-[-0.02em] transition-opacity hover:opacity-60">
            {BRAND.wordmark}
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {websiteNav.map((item) => {
            const active = item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (<Link key={item.href} href={item.href} className={cn("eyebrow relative py-1 transition-colors duration-200", active ? "text-ink" : "text-ink/50 hover:text-ink")}>
                  {item.label}
                  <span className={cn("absolute -bottom-0.5 left-0 h-px w-full origin-left bg-champagne transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]", active ? "scale-x-100" : "scale-x-0")}/>
                </Link>);
        })}
          </nav>

          <div className="flex items-center gap-3">
            <Link href={isAuthenticated ? "/account" : "/account/login"} className="eyebrow hidden items-center gap-2 py-1 text-ink/50 transition-colors hover:text-ink lg:inline-flex">
              <UserRound className="size-3.5"/>
              {isAuthenticated ? firstName : "Đăng nhập"}
            </Link>

            <Link href="/booking" className="eyebrow group hidden items-center gap-2 bg-ink px-5 py-3.5 text-ivory transition-colors duration-200 hover:bg-champagne hover:text-void sm:inline-flex">

              Đặt lịch ngay
              <ArrowRight className="size-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"/>
            </Link>

            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Mở menu" className="flex size-9 flex-col items-center justify-center gap-[5px] lg:hidden">
              <span className="block h-px w-5 bg-ink"/>
              <span className="block h-px w-5 bg-ink"/>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (<motion.div key="menu" initial={reduced ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }} animate={reduced ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" }} exit={reduced ? { opacity: 0 } : { clipPath: "inset(0% 0% 100% 0%)" }} transition={{ duration: 0.6, ease: EASE }} className="fixed inset-0 z-50 flex flex-col bg-void text-paper">
            <div className="flex items-center justify-between px-5 py-6 md:px-10">
              <span className="font-display text-[1.5rem] leading-none">
                {BRAND.wordmark}
              </span>
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Đóng menu" className="p-1 text-paper/60 transition-colors hover:text-paper">
                <X className="size-5"/>
              </button>
            </div>

            <nav className="flex flex-1 flex-col justify-center gap-1 px-5 md:px-10">
              {websiteNav.map((item, i) => (<motion.div key={item.href} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 + i * 0.06, duration: 0.6, ease: EASE }}>
                  <Link href={item.href} className="flex items-baseline gap-4 border-b border-paper/10 py-4 font-display text-[3rem] leading-none tracking-tight transition-colors hover:text-champagne">
                    <span className="eyebrow text-paper/30">
                      0{i + 1}
                    </span>
                    {item.label}
                  </Link>
                </motion.div>))}
            </nav>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45, duration: 0.6, ease: EASE }} className="space-y-3 px-5 pb-10 md:px-10">
              <Link href={isAuthenticated ? "/account" : "/account/login"} className="eyebrow flex items-center justify-center gap-2 border border-paper/25 px-6 py-4 text-paper/80">
                <UserRound className="size-3.5"/>
                {isAuthenticated ? `Tài khoản · ${firstName}` : "Đăng nhập / Đăng ký"}
              </Link>
              <Link href="/booking" className="eyebrow flex items-center justify-center gap-2 bg-champagne px-6 py-5 text-void">

                Đặt lịch ngay
                <ArrowRight className="size-3.5"/>
              </Link>
            </motion.div>
          </motion.div>) : null}
      </AnimatePresence>
    </>);
}
export function MobileBookingBar() {
    const pathname = usePathname();
    if (pathname.startsWith("/booking"))
        return null;
    return (<div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/85 p-3 backdrop-blur-xl sm:hidden">
      <Link href="/booking" className="eyebrow flex items-center justify-center gap-2 bg-ink py-4 text-ivory">

        Đặt lịch ngay
        <ArrowRight className="size-3.5"/>
      </Link>
    </div>);
}
