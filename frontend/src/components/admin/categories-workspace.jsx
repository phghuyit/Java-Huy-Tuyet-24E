"use client";
import * as React from "react";
import { toast } from "sonner";
import { AdminPage } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RightDrawer } from "@/components/ui/right-drawer";
import { FormError } from "./form-kit";
import { categoryService, nailService } from "@/services";
import { Toggle } from "./workspace";

export function CategoriesWorkspace() {
  const [editing, setEditing] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [services, setServices] = React.useState([]);

  const loadCategories = React.useCallback(async () => {
    try {
      const [data, svcs] = await Promise.all([
        categoryService.getAll().catch(() => []),
        nailService.getAll().catch(() => []),
      ]);
      if (Array.isArray(svcs)) setServices(svcs);
      if (Array.isArray(data)) {
        const mapped = data.map((item) => ({
          id: String(item.id),
          slug: item.slug || `category-${item.id}`,
          name: item.name,
          summary: item.description || "",
          description: item.description || "",
          active: item.status !== "INACTIVE" && item.active !== false,
        }));
        setCategories(mapped);
      }
    } catch {
    }
  }, []);

  React.useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <AdminPage
      eyebrow="VELA · Phân loại"
      title="Danh mục dịch vụ"
      actions={
        <Button variant="champagne" onClick={() => setEditing("new")}>
          Thêm danh mục
        </Button>
      }
    >
      <div className="divide-y divide-paper/10 border-y border-paper/10">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setEditing(c)}
            className="flex w-full flex-wrap justify-between gap-4 py-6 text-left hover:bg-paper/[0.04]"
          >
            <span>
              {c.name}
              <span className="mt-2 block text-xs text-paper/50">
                {c.summary}
              </span>
            </span>
            <span className="text-xs text-champagne">
              {services.filter((s) => String(s.categoryId) === String(c.id) || s.categorySlug === c.slug).length}{" "}
              dịch vụ · {c.active ? "Đang hoạt động" : "Ngừng hoạt động"} ·
              Chỉnh sửa →
            </span>
          </button>
        ))}
      </div>
      {editing && (
        <CategoryEditor
          category={editing}
          onSaved={loadCategories}
          onClose={() => setEditing(null)}
        />
      )}
    </AdminPage>
  );
}

function CategoryEditor({ category, onClose, onSaved }) {
  const [form, setForm] = React.useState(() =>
    category === "new"
      ? {
          id: crypto.randomUUID(),
          slug: `category-${Date.now()}`,
          name: "",
          headline: "",
          summary: "",
          description: "",
          active: true,
        }
      : category,
  );
  const [error, setError] = React.useState("");

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.summary || form.description || "",
      type: "SERVICE",
      status: form.active ? "ACTIVE" : "INACTIVE",
    };
    try {
      if (category === "new") {
        await categoryService.create(payload);
      } else if (/^\d+$/.test(String(form.id))) {
        await categoryService.update(form.id, payload);
      }
      toast.success("Đã lưu danh mục dịch vụ");
      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu danh mục.");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Xóa danh mục "${form.name}"?`)) return;
    try {
      if (/^\d+$/.test(String(form.id))) {
        await categoryService.delete(form.id);
      }
      toast.success("Đã xóa danh mục");
      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa danh mục.");
    }
  }

  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={category === "new" ? "Thêm danh mục" : "Chỉnh sửa danh mục"}
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {category !== "new" && (
            <Button
              variant="outlineLight"
              type="button"
              onClick={handleDelete}
            >
              Xóa
            </Button>
          )}
          <Button
            variant="champagne"
            type="submit"
            form="category-edit"
            className="ml-auto"
          >
            Lưu danh mục
          </Button>
        </div>
      }
    >
      <form
        id="category-edit"
        noValidate
        onSubmit={handleSave}
        className="space-y-6"
      >
        <Field label="Tên danh mục *">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Mô tả ngắn">
          <Textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </Field>
        <Toggle
          label="Đang hoạt động"
          checked={form.active}
          onChange={(active) => setForm({ ...form, active })}
        />
        <p className="text-xs text-paper/40">
          Ngừng hoạt động sẽ ẩn danh mục và dịch vụ liên quan khỏi lựa chọn đặt
          lịch mới.
        </p>
        <FormError message={error} />
      </form>
    </RightDrawer>
  );
}
