"use client";
import * as React from "react";
import Link from "next/link";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { EMAIL_PATTERN } from "@/lib/auth";
import {
  RESET_MINUTES,
  createResetTicket,
  resetPathFor,
} from "@/lib/password-reset";
import { authService } from "@/services";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
export function ForgotPasswordForm({ scope, tone, accountExists, loginHref }) {
  const dark = tone === "dark";
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [sentTo, setSentTo] = React.useState(null);
  const [demoLink, setDemoLink] = React.useState(null);
  async function submit(event) {
    event.preventDefault();
    const address = email.trim();
    if (!EMAIL_PATTERN.test(address)) {
      setError("Email không hợp lệ.");
      return;
    }
    setError("");
    setPending(true);
    try {
      const res = await authService.forgotPassword({ email: address, scope });
      if (res?.token) {
        const ticket = createResetTicket(scope, address, res.token, res.expiresAt);
        setDemoLink(resetPathFor(ticket));
      } else {
        setDemoLink(null);
      }
      setSentTo(address);
    } catch (cause) {
      setError(
        cause?.response?.data?.detail ||
          cause?.response?.data?.message ||
          "Không thể gửi yêu cầu đặt lại mật khẩu.",
      );
    } finally {
      setPending(false);
    }
  }
  if (sentTo) {
    return (
      <div className="space-y-7">
        <div
          className={cn(
            "flex items-start gap-3.5 border p-5",
            dark ? "border-paper/12" : "border-ink/12",
          )}
        >
          <MailCheck
            className={cn(
              "mt-0.5 size-4 shrink-0",
              dark ? "text-champagne" : "text-champagne",
            )}
          />
          <div>
            <p
              className={cn(
                "text-[0.9375rem]",
                dark ? "text-paper" : "text-ink",
              )}
            >
              Đã gửi hướng dẫn đặt lại mật khẩu
            </p>
            <p
              className={cn(
                "mt-2 text-[0.8125rem] leading-relaxed",
                dark ? "text-paper/45" : "text-ink/50",
              )}
            >
              Nếu{" "}
              <span className={dark ? "text-paper/80" : "text-ink/80"}>
                {sentTo}
              </span>{" "}
              có tài khoản, bạn sẽ nhận được liên kết đặt lại mật khẩu. Liên kết
              hết hạn sau {RESET_MINUTES} phút.
            </p>
          </div>
        </div>

        {demoLink ? (
          <div
            className={cn(
              "border border-dashed p-5",
              dark ? "border-champagne/30" : "border-champagne/50",
            )}
          >
            <p className="eyebrow text-champagne">Liên kết xác thực</p>
            <p
              className={cn(
                "mt-3 text-[0.8125rem] leading-relaxed",
                dark ? "text-paper/45" : "text-ink/50",
              )}
            >
              Nhấp vào liên kết bên dưới để tiến hành đặt lại mật khẩu cho tài
              khoản:
            </p>
            <Link
              href={demoLink}
              className={cn(
                "eyebrow mt-4 inline-flex items-center gap-2 border-b pb-1.5 transition-colors",
                dark
                  ? "border-champagne/40 text-champagne hover:border-champagne"
                  : "border-ink/25 text-ink/70 hover:border-ink hover:text-ink",
              )}
            >
              Đặt lại mật khẩu
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setDemoLink(null);
            }}
            className={cn(
              "text-[0.8125rem] underline underline-offset-4 transition-colors",
              dark
                ? "text-paper/50 decoration-paper/30 hover:text-paper"
                : "text-ink/55 decoration-ink/30 hover:text-ink",
            )}
          >
            Dùng email khác
          </button>
          <Link
            href={loginHref}
            className={cn(
              "text-[0.8125rem] underline underline-offset-4 transition-colors",
              dark
                ? "text-paper/50 decoration-paper/30 hover:text-paper"
                : "text-ink/55 decoration-ink/30 hover:text-ink",
            )}
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-7">
      <Field
        label="Email"
        hint="Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu."
      >
        <Input
          type="email"
          value={email}
          autoComplete="email"
          autoFocus
          placeholder={scope === "admin" ? "admin@vela.com" : "ban@example.com"}
          aria-invalid={Boolean(error)}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      {error ? (
        <p
          role="alert"
          className="border-l border-signal-stop pl-3 text-[0.8125rem] leading-relaxed text-signal-stop"
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant={dark ? "champagne" : "solid"}
        size="lg"
        disabled={pending}
        className={dark ? "w-full" : "w-full sm:w-auto"}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <ArrowRight className="size-3.5" />
        )}
        Gửi liên kết đặt lại
      </Button>
    </form>
  );
}
