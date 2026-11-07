"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { scopedStaffId } from "@/lib/permissions";
import { TODAY } from "@/lib/clock";
import { AdminPage, Panel } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RightDrawer } from "@/components/ui/right-drawer";
import { AdminSelect, FormError } from "./form-kit";
import { StaffEarnings } from "./staff-earnings";
import { staffService } from "@/services";
import {
  linkClass,
  Empty,
  Toggle,
  Search,
  saveAction,
} from "./workspace";

export function StaffWorkspace({ id }) {
  const { session } = useAuth();
  const mine = scopedStaffId(session);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [editing, setEditing] = React.useState(null);
  const [staffList, setStaffList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadStaff = React.useCallback(async () => {
    try {
      const staffData = await staffService.getAll().catch(() => []);
      if (Array.isArray(staffData)) {
        const mapped = staffData.map((item) => ({
          id: String(item.id),
          slug: item.slug || `staff-${item.id}`,
          name: item.name || item.fullName || "Chuyên viên VELA",
          role: item.jobTitle || item.role || "Chuyên viên làm móng",
          discipline: "Chăm sóc & tạo mẫu móng",
          email: item.email || "",
          phone: item.phone || "",
          active: item.active !== false && item.status !== "LOCKED",
          experienceYears: item.experienceYears ?? 3,
          bio: item.bio || "Chuyên viên giàu kinh nghiệm tại salon.",
          rating: item.rating || 5,
          reviewCount: item.reviewCount || 0,
          portrait: item.avatarUrl || "/images/photo-1533933269825-da140ad3132f.jpg",
          joinedAt: item.createdAt ? String(item.createdAt).slice(0, 10) : TODAY,
        }));
        setStaffList(mapped);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const wanted = id ?? mine;
  const cleanWanted = wanted ? String(wanted).replace(/^staff-/, "") : "";
  const member = wanted
    ? staffList.find(
        (s) =>
          String(s.id) === String(wanted) ||
          String(s.id) === cleanWanted ||
          s.slug === wanted ||
          s.slug === `staff-${wanted}`,
      )
    : undefined;
  if (mine && member && member.id !== mine)
    return (
      <AdminPage title="Không có quyền">
        <p className="text-sm text-paper/60">
          Bạn chỉ xem được hồ sơ của chính mình.
        </p>
      </AdminPage>
    );
  if (id && !member)
    return (
      <AdminPage title="Không tìm thấy nhân viên">
        <Link className={linkClass} href="/admin/staff">
          Về danh sách nhân viên
        </Link>
      </AdminPage>
    );
  if (member)
    return (
      <AdminPage
        eyebrow="VELA · Nhân viên"
        title={member.name}
        description={member.role}
        actions={
          <Button variant="champagne" onClick={() => setEditing(member)}>
            Chỉnh sửa nhân viên
          </Button>
        }
      >
        <Link className={linkClass} href="/admin/staff">
          ← Nhân viên
        </Link>
        <div className="my-8 grid gap-8 md:grid-cols-2">
          <Panel title="Hồ sơ">
            <p className="text-sm text-paper/60">{member.bio}</p>
            <p className="mt-4 text-sm">
              {member.phone} · {member.email}
            </p>
            <p className="mt-4 text-xs text-champagne">
              {member.active ? "Đang hoạt động" : "Ngừng hoạt động"} ·{" "}
              {member.experienceYears} năm kinh nghiệm
            </p>
            <Link
              className={`${linkClass} mt-5 inline-block`}
              href={`/artists/${member.slug}`}
            >
              Xem hồ sơ trên website
            </Link>
          </Panel>
          <Panel title="Thông tin công việc">
            <p className="text-sm text-paper/70">
              Nhân viên làm việc toàn thời gian và phụ trách tất cả các dịch vụ tại salon.
            </p>
          </Panel>
          <StaffEarnings member={member} />
        </div>
        <Link className={linkClass} href="/admin/calendar">
          Mở lịch làm việc
        </Link>
        {editing && (
          <StaffEditor
            member={editing}
            onClose={() => setEditing(null)}
            onSaved={loadStaff}
          />
        )}
      </AdminPage>
    );
  const rows = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || s.active === (filter === "active")),
  );
  return (
    <AdminPage
      eyebrow="VELA · Đội ngũ"
      title="Nhân viên"
      actions={
        <Button variant="champagne" onClick={() => setEditing("new")}>
          Thêm nhân viên
        </Button>
      }
    >
      <div className="mb-8 flex flex-wrap gap-5">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Tìm tên nhân viên…"
        />
        <Field label="Hoạt động">
          <AdminSelect
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </AdminSelect>
        </Field>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((s) => (
          <Panel key={s.id} title={s.role}>
            <Link
              href={`/admin/staff/${s.slug}`}
              className="font-display text-3xl"
            >
              {s.name}
            </Link>
            <p className="mt-3 text-xs text-paper/50">
              {s.active ? "Đang hoạt động" : "Ngừng hoạt động"} · Toàn thời gian
            </p>
            <div className="mt-6 flex gap-4">
              <Link className={linkClass} href={`/admin/staff/${s.slug}`}>
                Chi tiết & doanh số
              </Link>
              <button className={linkClass} onClick={() => setEditing(s)}>
                Chỉnh sửa
              </button>
            </div>
          </Panel>
        ))}
      </div>
      {!rows.length && <Empty />}
      {editing && (
        <StaffEditor
          member={editing}
          onClose={() => setEditing(null)}
          onSaved={loadStaff}
        />
      )}
    </AdminPage>
  );
}

function StaffEditor({ member, onClose, onSaved }) {
  const [form, setForm] = React.useState(() =>
    member === "new"
      ? {
          id: crypto.randomUUID(),
          slug: `staff-${Date.now()}`,
          name: "",
          role: "Chuyên viên làm móng",
          discipline: "Chăm sóc & tạo mẫu móng",
          bio: "Chuyên viên tận tâm với nhiều năm kinh nghiệm tại salon.",
          phone: "",
          email: "",
          rating: 5,
          reviewCount: 0,
          joinedAt: TODAY,
          experienceYears: 2,
          active: true,
          portrait: "/images/photo-1533933269825-da140ad3132f.jpg",
        }
      : member,
  );
  const [error, setError] = React.useState("");
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSave() {
    if (!form.name.trim()) throw new Error("Vui lòng nhập họ tên nhân viên.");
    if (!form.email.trim()) throw new Error("Vui lòng nhập email.");
    if (!form.phone.trim()) throw new Error("Vui lòng nhập số điện thoại.");
    const roleTitle = form.role.trim() || "Chuyên viên làm móng";
    const payload = {
      name: form.name.trim(),
      fullName: form.name.trim(),
      role: roleTitle,
      jobTitle: roleTitle,
      email: form.email.trim(),
      phone: form.phone.trim(),
      experienceYears: Number(form.experienceYears) || 0,
      bio: form.bio?.trim() || "",
      status: form.active ? "ACTIVE" : "LOCKED",
    };
    if (member === "new") {
      await staffService.create(payload);
    } else {
      if (/^\d+$/.test(String(form.id))) {
        await staffService.update(form.id, payload);
      }
    }
    toast.success("Đã lưu thông tin nhân viên");
    await onSaved?.();
  }

  async function handleDelete() {
    if (!window.confirm(`Xóa nhân viên ${form.name}?`)) return;
    try {
      if (/^\d+$/.test(String(form.id))) {
        await staffService.delete(form.id);
      }
      toast.success("Đã xóa nhân viên");
      onClose();
      await onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa nhân viên.");
    }
  }

  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={member === "new" ? "Thêm nhân viên" : "Chỉnh sửa nhân viên"}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {member !== "new" && /^\d+$/.test(String(form.id)) ? (
            <Button
              variant="ghostLight"
              type="button"
              onClick={handleDelete}
              className="text-signal-stop hover:text-signal-stop"
            >
              Xóa nhân viên
            </Button>
          ) : (
            <div />
          )}
          <Button variant="champagne" type="submit" form="staff-edit">
            Lưu nhân viên
          </Button>
        </div>
      }
    >
      <form
        id="staff-edit"
        onSubmit={(e) => {
          e.preventDefault();
          saveAction(handleSave, onClose, setError);
        }}
        noValidate
        className="space-y-6"
      >
        <Field label="Họ tên *">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Chức danh *">
          <Input
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          />
        </Field>
        <Field label="Chuyên môn">
          <Input
            value={form.discipline}
            onChange={(e) => set("discipline", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Điện thoại">
            <Input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Kinh nghiệm (năm)">
          <Input
            type="number"
            min={0}
            value={form.experienceYears}
            onChange={(e) => set("experienceYears", Number(e.target.value))}
          />
        </Field>
        <Field label="Giới thiệu">
          <Textarea
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </Field>
        <Toggle
          label="Đang hoạt động"
          checked={form.active}
          onChange={(v) => set("active", v)}
        />
        <FormError message={error} />
      </form>
    </RightDrawer>
  );
}
