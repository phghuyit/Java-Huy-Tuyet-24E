"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  startCustomerSession,
  useCustomerSession,
} from "@/lib/customer-session";
import { authService, userService } from "@/services";
import { DEMO_CUSTOMER } from "@/data/customers";
import { AccountAuthLayout } from "@/components/website/account/auth-layout";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/field";
export default function CustomerLoginPage() {
  return (
    <React.Suspense fallback={<AuthFallback />}>
      <LoginForm />
    </React.Suspense>
  );
}
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthenticated, ready } = useCustomerSession();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const next = params.get("next") ?? "/account";
  React.useEffect(() => {
    if (ready && isAuthenticated) router.replace(next);
  }, [ready, isAuthenticated, next, router]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const res = await authService.clientLogin({
        email: identifier.trim(),
        password,
      });

      let userPhone = res.phone || (!identifier.includes("@") ? identifier.trim() : "");
      let userEmail = res.email || (identifier.includes("@") ? identifier.trim() : "");
      let userName = res.name || res.fullName || "Khách hàng VELA";

      if (res.id && (!userPhone || !userEmail)) {
        try {
          const profile = await userService.getById(res.id);
          if (profile) {
            userPhone = profile.phone || userPhone;
            userEmail = profile.email || userEmail;
            userName = profile.fullName || userName;
          }
        } catch {}
      }

      if (!res.id && !res.userId) {
        throw new Error("Không lấy được mã định danh tài khoản từ máy chủ.");
      }

      const customer = {
        id: String(res.id || res.userId),
        name: userName,
        email: userEmail,
        phone: userPhone,
        token: res.token || null,
      };
      startCustomerSession(customer);
      router.replace(next);
    } catch (cause) {
      const msg = cause?.response?.data?.message || cause?.message || "Không thể đăng nhập.";
      setError(msg);
      setPending(false);
    }
  }
  return (
    <AccountAuthLayout
      eyebrow="Tài khoản khách hàng"
      lines={["ĐĂNG NHẬP"]}
      description={
        next.includes("booking")
          ? "Vui lòng đăng nhập để bắt đầu đặt lịch và đồng bộ đơn hàng vào tài khoản của bạn."
          : "Đăng nhập để xem lịch hẹn, theo dõi điểm tích lũy và đặt lịch nhanh hơn."
      }
      footer={
        <div className="space-y-3 text-[0.875rem] text-ink/50">
          <p>
            Chưa có tài khoản?{" "}
            <Link
              href={next !== "/account" ? `/account/register?next=${encodeURIComponent(next)}` : "/account/register"}
              className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
            >
              Tạo tài khoản
            </Link>
          </p>
          <p>
            Đặt lịch không cần tài khoản?{" "}
            <Link
              href="/booking/lookup"
              className="text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
            >
              Tra cứu bằng mã đặt lịch
            </Link>
          </p>
        </div>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-7">
        <Field
          label="Email hoặc số điện thoại"
          hint="Dùng đúng thông tin bạn đã đặt lịch trước đây để giữ lịch sử."
        >
          <Input
            value={identifier}
            autoComplete="username"
            autoFocus
            placeholder="0901234567"
            aria-invalid={Boolean(error)}
            onChange={(event) => setIdentifier(event.target.value)}
          />
        </Field>

        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="customer-password">Mật khẩu</Label>
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
            id="customer-password"
            type={reveal ? "text" : "password"}
            value={password}
            autoComplete="current-password"
            placeholder="Tối thiểu 8 ký tự"
            aria-invalid={Boolean(error)}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="pt-1 text-right">
            <Link
              href="/account/forgot-password"
              className="text-[0.75rem] text-ink/45 underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink"
            >
              Quên mật khẩu?
            </Link>
          </p>
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
          size="lg"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ArrowRight className="size-3.5" />
          )}
          {pending ? "Đang đăng nhập" : "Đăng nhập"}
        </Button>
      </form>

      <div className="mt-8 border border-ink/12 px-4 py-3.5">
        <p className="eyebrow text-ink/40">Tài khoản thử nghiệm</p>
        <p className="mt-2.5 text-[0.8125rem] tabular text-ink/70">
          {DEMO_CUSTOMER.phone} · {DEMO_CUSTOMER.password}
        </p>
        <p className="mt-1.5 text-[0.75rem] text-ink/40">
          Phạm Thu Hà — có sẵn lịch sử, điểm tích lũy và lịch hẹn sắp tới.
        </p>
        <button
          type="button"
          onClick={() => {
            setIdentifier(DEMO_CUSTOMER.phone);
            setPassword(DEMO_CUSTOMER.password);
            setError("");
          }}
          className="mt-3 text-[0.75rem] text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
        >
          Điền sẵn thông tin thử nghiệm
        </button>
      </div>
    </AccountAuthLayout>
  );
}
function AuthFallback() {
  return (
    <div className="gutter flex min-h-[60vh] items-center justify-center pt-36">
      <Loader2 className="size-5 animate-spin text-ink/30" />
    </div>
  );
}
