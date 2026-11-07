"use client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { AuthPanel } from "@/components/admin/auth-panel";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { authService } from "@/services";
export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <Content />
    </Suspense>
  );
}
function Content() {
  const { actions } = useAuth();
  return (
    <AuthPanel
      eyebrow="Khu vực quản trị"
      title="Đặt lại mật khẩu"
      description="Chọn mật khẩu mới cho tài khoản quản trị của bạn."
    >
      <ResetPasswordForm
        scope="admin"
        tone="dark"
        loginHref="/admin/login"
        forgotHref="/admin/forgot-password"
        onSubmit={async (email, password, token) => {
          await authService.resetPassword({ token, email, password });
          try {
            actions.setAdminPassword(email, password);
          } catch {}
        }}
      />
    </AuthPanel>
  );
}
function Fallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-void">
      <Loader2 className="size-5 animate-spin text-paper/30" />
    </div>
  );
}
