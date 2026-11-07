"use client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AccountAuthLayout } from "@/components/website/account/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { authService } from "@/services";
export default function CustomerResetPasswordPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <Content />
    </Suspense>
  );
}
function Content() {
  return (
    <AccountAuthLayout
      eyebrow="Tài khoản khách hàng"
      lines={["ĐẶT MẬT KHẨU"]}
      description="Chọn mật khẩu mới cho tài khoản của bạn. Nếu trước đây bạn đặt lịch không cần tài khoản, đây cũng là bước tạo mật khẩu."
    >
      <ResetPasswordForm
        scope="customer"
        tone="light"
        loginHref="/account/login"
        forgotHref="/account/forgot-password"
        onSubmit={async (email, password, token) => {
          await authService.resetPassword({ token, email, password });
        }}
      />
    </AccountAuthLayout>
  );
}
function Fallback() {
  return (
    <div className="gutter flex min-h-[60vh] items-center justify-center pt-36">
      <Loader2 className="size-5 animate-spin text-ink/30" />
    </div>
  );
}
