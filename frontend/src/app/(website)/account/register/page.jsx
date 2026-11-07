"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { startCustomerSession } from "@/lib/customer-session";
import { authService } from "@/services";
import { AccountAuthLayout } from "@/components/website/account/auth-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/field";
import {
  PasswordChecklist,
  passwordMeetsRules,
} from "@/components/auth/password-rules";
export default function CustomerRegisterPage() {
  return (
    <React.Suspense fallback={<div className="gutter min-h-dvh pt-40 text-center text-sm text-ink/50">Đang tải…</div>}>
      <RegisterForm />
    </React.Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
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
    setPending(true);
    try {
      const apiRes = await authService.clientRegister({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      let loggedUser = apiRes;
      try {
        const loginRes = await authService.clientLogin({
          email: email.trim(),
          password,
        });
        if (loginRes) loggedUser = loginRes;
      } catch (_) {}

      const customer = {
        id: String(loggedUser?.id || loggedUser?.userId || apiRes?.id || "cus-guest"),
        name: loggedUser?.name || loggedUser?.fullName || name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      startCustomerSession(customer);
      router.replace(next);
    } catch (cause) {
      const msg = cause?.response?.data?.message || cause?.message || "Không thể tạo tài khoản.";
      setError(msg);
      setPending(false);
    }
  }
  return (
    <AccountAuthLayout
      eyebrow="Tài khoản khách hàng"
      lines={["TẠO TÀI KHOẢN"]}
      description={
        next.includes("booking")
          ? "Tạo tài khoản để hoàn tất đặt lịch và lưu lịch sử làm đẹp của bạn."
          : "Nếu bạn từng đặt lịch tại VELA, hãy dùng đúng số điện thoại cũ — lịch sử và điểm tích lũy sẽ được giữ nguyên."
      }
      footer={
        <p className="text-[0.875rem] text-ink/50">
          Đã có tài khoản?{" "}
          <Link
            href={next !== "/account" ? `/account/login?next=${encodeURIComponent(next)}` : "/account/login"}
            className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
          >
            Đăng nhập
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-7">
        <Field label="Họ và tên *">
          <Input
            value={name}
            autoComplete="name"
            autoFocus
            placeholder="Nguyễn Minh Anh"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <Field label="Số điện thoại *">
            <Input
              value={phone}
              type="tel"
              autoComplete="tel"
              placeholder="0901234567"
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>

          <Field label="Email *">
            <Input
              value={email}
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="customer-new-password">Mật khẩu *</Label>
            <button
              type="button"
              onClick={() => setReveal((value) => !value)}
              className="flex items-center gap-1.5 text-[0.6875rem] text-ink/40 transition-colors hover:text-ink"
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
            id="customer-new-password"
            type={reveal ? "text" : "password"}
            value={password}
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />

          <PasswordChecklist value={password} tone="light" className="mt-3.5" />
        </div>

        <Field label="Nhập lại mật khẩu *">
          <Input
            type={reveal ? "text" : "password"}
            value={confirm}
            autoComplete="new-password"
            onChange={(event) => setConfirm(event.target.value)}
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
          size="lg"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ArrowRight className="size-3.5" />
          )}
          {pending ? "Đang tạo tài khoản" : "Tạo tài khoản"}
        </Button>
      </form>
    </AccountAuthLayout>
  );
}
