"use client";
import * as React from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { AnimatedText } from "@/components/motion/animated-text";
export default function RootError({ error, reset }) {
  if (error?.digest?.startsWith("NEXT_REDIRECT") || error?.message === "NEXT_REDIRECT") {
    throw error;
  }
  React.useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="gutter flex min-h-dvh flex-col justify-center bg-ivory py-16 text-ink">
      <Link
        href="/"
        className="mb-16 font-display text-[1.5rem] leading-none tracking-[-0.02em] transition-opacity hover:opacity-60"
      >
        VELA.
      </Link>

      <div className="max-w-3xl">
        <p className="eyebrow text-signal-stop">Đã xảy ra lỗi</p>

        <AnimatedText
          as="h1"
          immediate
          lines={["CÓ GÌ ĐÓ", "KHÔNG ỔN."]}
          className="mt-6 font-display text-d2 font-light"
        />

        <p className="mt-7 max-w-[52ch] text-[1rem] leading-relaxed text-ink/55">
          Trang này không tải được. Bạn có thể thử lại — nếu vẫn lỗi, hãy gọi
          salon theo số 0901 000 888 để được đặt lịch trực tiếp.
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-x-3 gap-y-4">
          <button
            type="button"
            onClick={reset}
            className="eyebrow group inline-flex items-center gap-2.5 bg-ink px-6 py-4 text-ivory transition-colors duration-200 hover:bg-champagne hover:text-void"
          >
            <RotateCcw className="size-3.5" />
            Thử lại
          </button>
          <Link
            href="/"
            className="eyebrow inline-flex items-center gap-2 border-b border-ink/25 pb-2 text-ink/70 transition-colors hover:border-ink hover:text-ink"
          >
            Về trang chủ
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-12 border-t border-ink/10 pt-6 font-mono text-[0.75rem] text-ink/35">
            Mã lỗi: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
