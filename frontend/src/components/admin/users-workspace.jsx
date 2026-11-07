"use client";
import * as React from "react";
import { toast } from "sonner";
import { AdminPage } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { RightDrawer } from "@/components/ui/right-drawer";
import { AdminSelect, FormError } from "./form-kit";
import { requestApi } from "@/lib/api";
import { emptyClass } from "./workspace";

export function UsersWorkspace() {
  const [users, setUsers] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        requestApi("/users").catch(() => []),
        requestApi("/api/roles").catch(() => []),
      ]);
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(rolesData)) setRoles(rolesData);
    } catch {
      toast.error("Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = users.filter((u) => {
    const matchSearch =
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || "").includes(search);
    const code = u.role?.code || "CUSTOMER";
    const matchRole = roleFilter === "all" || code.toUpperCase() === roleFilter.toUpperCase();
    return matchSearch && matchRole;
  });

  return (
    <AdminPage
      eyebrow="VELA · Hệ thống"
      title="Quản lý tài khoản"
      description="Quản lý danh sách người dùng, phân quyền truy cập (Admin, Lễ tân, Nhân viên, Khách hàng) và bảo mật."
      actions={
        <Button variant="champagne" onClick={() => setEditing("new")}>
          Thêm người dùng
        </Button>
      }
    >
      <div className="mb-8 flex flex-wrap items-end gap-5">
        <div className="min-w-[260px] flex-1">
          <Field label="Tìm kiếm tài khoản">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại…"
            />
          </Field>
        </div>
        <div className="w-52">
          <Field label="Vai trò">
            <AdminSelect
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              {roles.map((r) => (
                <option key={r.id} value={r.code}>
                  {r.name || r.code}
                </option>
              ))}
            </AdminSelect>
          </Field>
        </div>
      </div>

      {loading ? (
        <div className={emptyClass}>Đang tải dữ liệu người dùng…</div>
      ) : filtered.length === 0 ? (
        <div className={emptyClass}>Không có tài khoản nào phù hợp.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-paper/10 text-xs uppercase tracking-wider text-paper/40">
                <th className="py-3 pr-4">Họ và tên</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Số điện thoại</th>
                <th className="py-3 pr-4">Vai trò</th>
                <th className="py-3 pr-4">Trạng thái</th>
                <th className="py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/10">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-paper/[0.02]">
                  <td className="py-4 pr-4 font-medium text-paper">
                    {user.fullName}
                  </td>
                  <td className="py-4 pr-4 text-paper/70">{user.email}</td>
                  <td className="py-4 pr-4 text-paper/70">{user.phone || "—"}</td>
                  <td className="py-4 pr-4">
                    <span className="rounded bg-paper/10 px-2 py-0.5 text-xs font-semibold text-champagne">
                      {user.role?.name || user.role?.code || "Khách hàng"}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        user.status === "ACTIVE"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          user.status === "ACTIVE" ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      {user.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => setEditing(user)}
                      className="text-xs text-champagne underline underline-offset-4 hover:opacity-80"
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <UserEditor
          user={editing}
          roles={roles}
          onClose={() => setEditing(null)}
          onSaved={loadData}
        />
      )}
    </AdminPage>
  );
}

function UserEditor({ user, roles, onClose, onSaved }) {
  const isNew = user === "new";
  const [form, setForm] = React.useState({
    fullName: isNew ? "" : user.fullName || "",
    email: isNew ? "" : user.email || "",
    phone: isNew ? "" : user.phone || "",
    password: "",
    roleId: isNew
      ? (roles.find((r) => (r.code || "").toUpperCase() !== "STAFF")?.id || 4)
      : (user.role?.id || 4),
    status: isNew ? "ACTIVE" : (user.status || "ACTIVE"),
  });
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!form.email.trim()) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    if (isNew && (!form.password || form.password.length < 8)) {
      setError("Mật khẩu mới tối thiểu 8 ký tự.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        roleId: Number(form.roleId),
        status: form.status,
      };
      if (form.password) {
        payload.password = form.password;
      }

      if (isNew) {
        await requestApi("/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Đã tạo người dùng mới thành công.");
      } else {
        await requestApi(`/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toast.success("Cập nhật thông tin người dùng thành công.");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra khi lưu người dùng.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}"?`)) {
      return;
    }
    setSaving(true);
    try {
      await requestApi(`/users/${user.id}`, { method: "DELETE" });
      toast.success("Đã xóa tài khoản.");
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.message || "Không thể xóa tài khoản.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={isNew ? "Thêm người dùng mới" : "Chỉnh sửa tài khoản"}
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          {!isNew ? (
            <Button
              variant="outlineLight"
              type="button"
              disabled={saving}
              onClick={handleDelete}
              className="text-rose-400 hover:border-rose-400 hover:text-rose-300"
            >
              Xóa tài khoản
            </Button>
          ) : <div />}
          <Button
            variant="champagne"
            type="submit"
            form="user-edit-form"
            disabled={saving}
          >
            {saving ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </div>
      }
    >
      <form id="user-edit-form" onSubmit={handleSubmit} className="space-y-6">
        <Field label="Họ và tên *">
          <Input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Nguyễn Văn A"
            required
          />
        </Field>

        <Field label="Địa chỉ Email *">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="example@gmail.com"
            required
          />
        </Field>

        <Field label="Số điện thoại">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0901234567"
          />
        </Field>

        <Field
          label={isNew ? "Mật khẩu *" : "Mật khẩu mới (để trống nếu không đổi)"}
        >
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={isNew ? "Tối thiểu 8 ký tự" : "••••••••"}
          />
        </Field>

        <Field label="Phân quyền (Vai trò)">
          <AdminSelect
            value={form.roleId}
            onChange={(e) => setForm({ ...form, roleId: e.target.value })}
          >
            {roles.filter((r) => (r.code || "").toUpperCase() !== "STAFF").map((r) => (
              <option key={r.id} value={r.id}>
                {r.name || r.code}
              </option>
            ))}
          </AdminSelect>
        </Field>

        <Field label="Trạng thái tài khoản">
          <AdminSelect
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="LOCKED">Khóa tài khoản (LOCKED)</option>
          </AdminSelect>
        </Field>

        <FormError message={error} />
      </form>
    </RightDrawer>
  );
}
