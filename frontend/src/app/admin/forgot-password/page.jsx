"use client";
import { useAuth } from "@/lib/auth-store";
import { AuthPanel } from "@/components/admin/auth-panel";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
export default function AdminForgotPasswordPage() {
  const { actions } = useAuth();
  return (
    <AuthPanel
      eyebrow="Khu vực quản trị"
      title="Quên mật khẩu"
      description="Nhập email quản trị. Chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu."
    >
      <ForgotPasswordForm
        scope="admin"
        tone="dark"
        accountExists={actions.hasAdminAccount}
        loginHref="/admin/login"
      />
    </AuthPanel>
  );
}
