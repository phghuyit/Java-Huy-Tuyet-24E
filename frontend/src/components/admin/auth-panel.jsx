"use client";
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PHOTOS, img } from "@/data/images";
export function AuthPanel({ eyebrow, title, description, children, footer }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-char lg:block">
        <Image
          src={img(PHOTOS.interior[0], 1600)}
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/65 to-void/20" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <Link
            href="/"
            className="font-display text-[1.75rem] leading-none tracking-[-0.02em] transition-opacity hover:opacity-70"
          >
            VELA.
          </Link>

          <div>
            <p className="eyebrow text-champagne">Hệ thống quản trị salon</p>
            <p className="mt-6 max-w-[18ch] font-display text-[3.25rem] leading-[1.06] tracking-tight xl:text-[4rem]">
              Lịch hẹn, khách hàng và nhân viên trong một màn hình.
            </p>
            <p className="mt-7 max-w-[42ch] text-[0.9375rem] leading-relaxed text-paper/45">
              Chỉ tài khoản quản trị mới truy cập được khu vực này. Khách hàng
              đặt lịch trên website mà không cần tạo tài khoản.
            </p>
          </div>

          <p className="text-[0.75rem] text-paper/30">
            VELA Salon · 842 Valencia Street
          </p>
        </div>
      </aside>

      <main className="flex flex-col justify-center bg-void px-5 py-12 md:px-12 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-[0.75rem] text-paper/40 transition-colors hover:text-paper lg:hidden"
          >
            <ArrowLeft className="size-3.5" />
            Về trang chủ
          </Link>

          <p className="eyebrow text-champagne">{eyebrow}</p>
          <h1 className="mt-5 font-display text-[2.75rem] leading-none tracking-tight md:text-[3.25rem]">
            {title}
          </h1>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-paper/45">
            {description}
          </p>

          <div className="mt-10">{children}</div>

          {footer ? (
            <div className="mt-8 border-t border-paper/10 pt-6">{footer}</div>
          ) : null}

          <Link
            href="/"
            className="mt-10 hidden items-center gap-2 text-[0.75rem] text-paper/35 transition-colors hover:text-paper lg:inline-flex"
          >
            <ArrowLeft className="size-3.5" />
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}
