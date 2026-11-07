"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { DEMO_ADMIN, DEMO_DESK } from "@/data/admin-users";
import { AuthPanel } from "@/components/admin/auth-panel";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/field";
import { FormError } from "@/components/admin/form-kit";
export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<AuthFallback />}>
      <LoginForm />
    </React.Suspense>
  );
}
function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { actions, isAuthenticated, ready } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [reveal, setReveal] = React.useState(false);
  const [error, setError] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const next = params.get("next") ?? "/admin/dashboard";
  React.useEffect(() => {
    if (ready && isAuthenticated) router.replace(next);
  }, [ready, isAuthenticated, next, router]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      await actions.login(email, password);
      router.replace(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đăng nhập.");
      setPending(false);
    }
  }
  return (
    <AuthPanel
      eyebrow="Khu vực quản trị"
      title="Đăng nhập"
      description="Nhập tài khoản quản trị để vào bảng điều khiển salon."
    >
      <form onSubmit={submit} noValidate className="space-y-7">
        <Field label="Email">
          <Input
            type="email"
            value={email}
            autoComplete="username"
            autoFocus
            placeholder="admin@vela.com"
            aria-invalid={Boolean(error)}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>

        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between gap-4">
            <Label htmlFor="admin-password">Mật khẩu</Label>
            <button
              type="button"
              onClick={() => setReveal((value) => !value)}
              className="flex items-center gap-1.5 text-[0.6875rem] text-paper/35 transition-colors hover:text-paper"
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
            id="admin-password"
            type={reveal ? "text" : "password"}
            value={password}
            autoComplete="current-password"
            placeholder="Tối thiểu 8 ký tự"
            aria-invalid={Boolean(error)}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className="pt-1 text-right">
            <Link
              href="/admin/forgot-password"
              className="text-[0.75rem] text-paper/40 underline decoration-paper/25 underline-offset-4 transition-colors hover:text-paper"
            >
              Quên mật khẩu?
            </Link>
          </p>
        </div>

        <FormError message={error} />

        <Button
          type="submit"
          variant="champagne"
          size="lg"
          disabled={pending}
          className="w-full"
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ArrowRight className="size-3.5" />
          )}
          {pending ? "Đang đăng nhập" : "Đăng nhập"}
        </Button>
      </form>

      <div className="mt-8 border border-paper/10 px-4 py-3.5">
        <p className="eyebrow text-paper/30">Tài khoản thử nghiệm</p>
        <ul className="mt-3 space-y-3.5">
          {[
            {
              label: "Chủ salon",
              account: DEMO_ADMIN,
              note: "thấy doanh thu, bảng giá, báo cáo",
            },
            {
              label: "Lễ tân",
              account: DEMO_DESK,
              note: "quản lý đơn hẹn, đón khách và thu tiền",
            },
          ].map(({ label, account, note }) => (
            <li key={account.email}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-[0.75rem] text-champagne">{label}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError("");
                  }}
                  className="text-[0.75rem] text-paper/50 underline underline-offset-4 transition-colors hover:text-paper"
                >
                  Điền sẵn
                </button>
              </div>
              <p className="mt-1 text-[0.8125rem] tabular text-paper/60">
                {account.email} · {account.password}
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-paper/35">{note}</p>
            </li>
          ))}
        </ul>
      </div>
    </AuthPanel>
  );
}
function AuthFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-void">
      <Loader2 className="size-5 animate-spin text-paper/30" />
    </div>
  );
}
