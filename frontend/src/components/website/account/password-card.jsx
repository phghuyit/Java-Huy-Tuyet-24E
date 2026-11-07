"use client";
import * as React from "react";
import { Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { userService } from "@/services";
import { Button } from "@/components/ui/button";
import { Field, Input, Label } from "@/components/ui/field";
import { PasswordChecklist, passwordMeetsRules, } from "@/components/auth/password-rules";
export function PasswordCard({ customerId }) {
    const [open, setOpen] = React.useState(false);
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [nextPassword, setNextPassword] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const [reveal, setReveal] = React.useState(false);
    const [error, setError] = React.useState("");
    const [saved, setSaved] = React.useState(false);
    function reset() {
        setCurrentPassword("");
        setNextPassword("");
        setConfirm("");
        setError("");
    }
    async function submit(event) {
        event.preventDefault();
        setError("");
        if (nextPassword !== confirm) {
            setError("Mật khẩu nhập lại không khớp.");
            return;
        }
        if (!passwordMeetsRules(nextPassword)) {
            setError("Mật khẩu mới chưa đạt yêu cầu bên dưới.");
            return;
        }
        try {
            await userService.changeMyPassword({ currentPassword, password: nextPassword });
            reset();
            setOpen(false);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 3000);
        }
        catch (cause) {
            setError(
                cause?.response?.data?.detail ||
                cause?.response?.data?.message ||
                cause?.message ||
                "Mật khẩu hiện tại không đúng hoặc không thể đổi mật khẩu."
            );
        }
    }
    return (<div className="border border-ink/12 p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="eyebrow text-ink/45">Mật khẩu</h2>
        {!open ? (<button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[0.75rem] text-ink/40 transition-colors hover:text-ink">
            <KeyRound className="size-3"/>
            Đổi mật khẩu
          </button>) : null}
      </div>

      {open ? (<form onSubmit={submit} noValidate className="mt-6 space-y-6">
          <Field label="Mật khẩu hiện tại">
            <Input type={reveal ? "text" : "password"} value={currentPassword} autoComplete="current-password" autoFocus onChange={(event) => setCurrentPassword(event.target.value)}/>
          </Field>

          <div className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <Label htmlFor="account-new-password">Mật khẩu mới</Label>
              <button type="button" onClick={() => setReveal((value) => !value)} className="flex items-center gap-1.5 text-[0.6875rem] text-ink/40 transition-colors hover:text-ink">
                {reveal ? <EyeOff className="size-3.5"/> : <Eye className="size-3.5"/>}
                {reveal ? "Ẩn" : "Hiện"}
              </button>
            </div>
            <Input id="account-new-password" type={reveal ? "text" : "password"} value={nextPassword} autoComplete="new-password" onChange={(event) => setNextPassword(event.target.value)}/>
            <PasswordChecklist value={nextPassword} className="mt-3.5"/>
          </div>

          <Field label="Nhập lại mật khẩu mới" error={error}>
            <Input type={reveal ? "text" : "password"} value={confirm} autoComplete="new-password" onChange={(event) => setConfirm(event.target.value)}/>
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" type="submit">
              Lưu mật khẩu
            </Button>
            <Button size="sm" variant="ghost" type="button" onClick={() => {
                setOpen(false);
                reset();
            }}>
              Hủy
            </Button>
          </div>
        </form>) : (<p className="mt-6 text-[0.8125rem] leading-relaxed text-ink/45">
          Đổi mật khẩu ngay tại đây, không cần đăng xuất. Bạn sẽ cần nhập mật
          khẩu hiện tại để xác nhận.
        </p>)}

      {saved ? (<p role="status" className="mt-5 flex items-center gap-2 text-[0.8125rem] text-ink/50">
          <Check className="size-3.5 text-champagne"/>
          Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.
        </p>) : null}
    </div>);
}
