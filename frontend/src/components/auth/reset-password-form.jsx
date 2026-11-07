"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CircleCheck,
  Eye,
  EyeOff,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TICKET_CHECKING,
  consumeResetTicket,
  resolveTicket,
  subscribeToTicket,
} from "@/lib/password-reset";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { PasswordChecklist, passwordMeetsRules } from "./password-rules";
export function ResetPasswordForm({
  scope,
  tone,
  loginHref,
  forgotHref,
  onSubmit,
}) {
  const dark = tone === "dark";
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const state = React.useSyncExternalStore(
    subscribeToTicket,
    () => resolveTicket(token, scope),
    () => TICKET_CHECKING,
  );
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const muted = dark ? "text-paper/45" : "text-ink/50";
  if (state.status === "checking") {
    return (
      <div className="flex items-center gap-3">
        <Loader2 className={cn("size-4 animate-spin", muted)} />
        <span className={cn("text-[0.875rem]", muted)}>
          Đang kiểm tra liên kết…
        </span>
      </div>
    );
  }
  if (state.status === "invalid") {
    return (
      <div className="space-y-7">
        <div
          className={cn(
            "flex items-start gap-3.5 border p-5",
            dark ? "border-signal-stop/40" : "border-signal-stop/40",
          )}
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-signal-stop" />
          <p
            className={cn(
              "text-[0.875rem] leading-relaxed",
              dark ? "text-paper/70" : "text-ink/70",
            )}
          >
            {state.message}
          </p>
        </div>

        <Button asChild variant={dark ? "champagne" : "solid"} size="lg">
          <Link href={forgotHref}>
            <ArrowRight className="size-3.5" />
            Yêu cầu liên kết mới
          </Link>
        </Button>
      </div>
    );
  }
  if (done) {
    return (
      <div className="space-y-7">
        <div
          className={cn(
            "flex items-start gap-3.5 border p-5",
            dark ? "border-paper/12" : "border-ink/12",
          )}
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0 text-signal-live" />
          <div>
            <p
              className={cn(
                "text-[0.9375rem]",
                dark ? "text-paper" : "text-ink",
              )}
            >
              Đã đặt lại mật khẩu
            </p>
            <p className={cn("mt-2 text-[0.8125rem] leading-relaxed", muted)}>
              Mọi thiết bị đang đăng nhập đã được đăng xuất. Hãy đăng nhập lại
              bằng mật khẩu mới.
            </p>
          </div>
        </div>

        <Button asChild variant={dark ? "champagne" : "solid"} size="lg">
          <Link href={loginHref}>
            <ArrowRight className="size-3.5" />
            Đăng nhập
          </Link>
        </Button>
      </div>
    );
  }
  const email = state.email;
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (!passwordMeetsRules(password)) {
      setError("Mật khẩu chưa đạt yêu cầu bên dưới.");
      return;
    }
    try {
      await onSubmit(email, password, token);
      consumeResetTicket(token);
      setDone(true);
    } catch (cause) {
      setError(
        cause?.response?.data?.detail ||
          cause?.response?.data?.message ||
          (cause instanceof Error ? cause.message : "Không thể đặt lại mật khẩu."),
      );
    }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-7">
      <p className={cn("text-[0.875rem]", muted)}>
        Đặt mật khẩu mới cho{" "}
        <span className={dark ? "text-paper/85" : "text-ink/85"}>{email}</span>
      </p>

      <div className="space-y-2.5">
        <div className="flex items-baseline justify-between gap-4">
          <Label htmlFor="reset-password">Mật khẩu mới</Label>
          <button
            type="button"
            onClick={() => setReveal((value) => !value)}
            className={cn(
              "flex items-center gap-1.5 text-[0.6875rem] transition-colors",
              dark
                ? "text-paper/35 hover:text-paper"
                : "text-ink/40 hover:text-ink",
            )}
          >
            {reveal ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
            {reveal ? "Ẩn" : "Hiện"}
          </button>
        </div>
        <Input
          id="reset-password"
          type={reveal ? "text" : "password"}
          value={password}
          autoComplete="new-password"
          autoFocus
          onChange={(event) => setPassword(event.target.value)}
        />
        <PasswordChecklist value={password} tone={tone} className="mt-3.5" />
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="reset-confirm">Nhập lại mật khẩu</Label>
        <Input
          id="reset-confirm"
          type={reveal ? "text" : "password"}
          value={confirm}
          autoComplete="new-password"
          onChange={(event) => setConfirm(event.target.value)}
        />
      </div>

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
        className={dark ? "w-full" : "w-full sm:w-auto"}
      >
        <ArrowRight className="size-3.5" />
        Đặt lại mật khẩu
      </Button>
    </form>
  );
}
