"use client";
import { AccountAuthLayout } from "@/components/website/account/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
export default function CustomerForgotPasswordPage() {
  return (
    <AccountAuthLayout
      eyebrow="Tài khoản khách hàng"
      lines={["QUÊN MẬT KHẨU"]}
      description="Nhập email bạn dùng khi đặt lịch. Chúng tôi sẽ gửi liên kết để bạn đặt lại mật khẩu."
    >
      <ForgotPasswordForm
        scope="customer"
        tone="light"
        accountExists={() => true}
        loginHref="/account/login"
      />
    </AccountAuthLayout>
  );
}
