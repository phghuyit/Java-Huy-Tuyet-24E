"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { currency } from "@/lib/format";
import { AdminPage } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RightDrawer } from "@/components/ui/right-drawer";
import { AdminSelect, FormError } from "./form-kit";
import { nailService, categoryService, staffService } from "@/services";
import {
  linkClass,
  Empty,
  Toggle,
  Search,
} from "./workspace";

export function ServicesWorkspace() {
  const params = useSearchParams();
  const requested = params.get("service");
  const [editor, setEditor] = React.useState(null);
  const [dismissed, setDismissed] = React.useState(null);
  const [services, setServices] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [staffList, setStaffList] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [filter, setFilter] = React.useState("all");

  const loadServices = React.useCallback(async () => {
    try {
      const [data, cats, staffData] = await Promise.all([
        nailService.getAll().catch(() => []),
        categoryService.getAll().catch(() => []),
        staffService.getAll().catch(() => []),
      ]);
      const mappedCats = (cats || []).map((c) => ({
        id: String(c.id),
        slug: c.slug || `category-${c.id}`,
        name: c.name,
      }));
      if (Array.isArray(cats)) {
        setCategories(mappedCats);
      }
      if (Array.isArray(staffData)) {
        setStaffList(staffData);
      }
      if (Array.isArray(data)) {
        const mapped = data.map((item) => {
          const matchedCat = mappedCats.find((c) => String(c.id) === String(item.categoryId));
          return {
            id: String(item.id),
            slug: item.slug || `service-${item.id}`,
            name: item.name,
            summary: item.description || "",
            description: item.description || "",
            price: Number(item.price) || 0,
            durationMin: item.durationMinutes || 60,
            active: item.status !== "INACTIVE" && item.active !== false,
            categoryId: item.categoryId != null ? String(item.categoryId) : (mappedCats[0]?.id || "1"),
            categoryName: matchedCat?.name || "Chưa phân loại",
            categorySlug: matchedCat?.slug || "general",
            tags: item.tags || [],
            image: item.imageUrl || null,
            includes: item.includes || [],
            aftercare: item.aftercare || [],
            gallery: item.gallery || [],
            featured: Boolean(item.featured),
            signature: Boolean(item.signature),
          };
        });
        setServices(mapped);
      }
    } catch {
    }
  }, []);

  React.useEffect(() => {
    loadServices();
  }, [loadServices]);

  const editing =
    editor ??
    (requested !== dismissed
      ? services.find((s) => s.id === requested)
      : null);

  const rows = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "all" || String(s.categoryId) === String(category) || s.categorySlug === category) &&
      (filter === "all" || s.active === (filter === "active")),
  );
  return (
    <AdminPage
      eyebrow="VELA · Danh mục dịch vụ"
      title="Dịch vụ"
      actions={
        <Button variant="champagne" onClick={() => setEditor("new")}>
          Thêm dịch vụ
        </Button>
      }
    >
      <div className="mb-8 flex flex-wrap gap-5">
        <Search
          value={search}
          onChange={setSearch}
          placeholder="Tìm tên dịch vụ…"
        />
        <Field label="Danh mục">
          <AdminSelect
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </AdminSelect>
        </Field>
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
      <div className="divide-y divide-paper/10 border-y border-paper/10">
        {rows.map((s) => (
          <button
            key={s.id}
            onClick={() => setEditor(s)}
            className="flex w-full flex-wrap items-center justify-between gap-4 py-5 text-left hover:bg-paper/[0.04]"
          >
            <span>
              <span className="block">{s.name}</span>
              <span className="mt-2 block text-xs text-paper/50">
                {s.categoryName || categories.find((c) => String(c.id) === String(s.categoryId))?.name || s.categorySlug}{" "}
                · {s.durationMin} phút ·{" "}
                {s.active ? "Đang hoạt động" : "Ngừng hoạt động"}
                {s.featured ? " · Nổi bật" : ""}
              </span>
            </span>
            <span className="text-sm tabular text-champagne">
              {currency(s.price)} · Chỉnh sửa →
            </span>
          </button>
        ))}
      </div>
      {!rows.length && <Empty />}
      {editing && (
        <ServiceEditor
          key={typeof editing === "string" ? editing : editing.id}
          service={editing}
          categories={categories}
          onSaved={loadServices}
          onClose={() => {
            setEditor(null);
            setDismissed(requested);
          }}
        />
      )}
    </AdminPage>
  );
}

function ServiceEditor({ service, categories = [], onClose, onSaved }) {
  const [form, setForm] = React.useState(() =>
    service === "new"
      ? {
          id: crypto.randomUUID(),
          slug: `service-${Date.now()}`,
          name: "",
          summary: "",
          description: "",
          includes: [],
          aftercare: [],
          gallery: [],
          active: true,
          featured: false,
          signature: false,
          price: 0,
          durationMin: 60,
          categoryId: categories[0]?.id ? String(categories[0].id) : "1",
        }
      : {
          ...service,
          categoryId: service.categoryId != null ? String(service.categoryId) : (categories[0]?.id ? String(categories[0].id) : "1"),
        },
  );
  const [error, setError] = React.useState("");
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const parsedCatId = parseInt(form.categoryId, 10);
    const categoryId = Number.isInteger(parsedCatId) && parsedCatId > 0
      ? parsedCatId
      : (categories[0]?.id ? parseInt(categories[0].id, 10) : 1);
    const payload = {
      name: form.name.trim(),
      description: form.description || form.summary || "",
      price: form.price,
      durationMinutes: form.durationMin,
      status: form.active ? "ACTIVE" : "INACTIVE",
      imageUrl: form.image || null,
      categoryId,
    };
    try {
      if (service === "new") {
        await nailService.create(payload);
      } else if (/^\d+$/.test(String(form.id))) {
        await nailService.update(form.id, payload);
      }
      toast.success("Đã lưu thông tin dịch vụ");
      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu dịch vụ.");
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Xóa dịch vụ "${form.name}"?`)) return;
    try {
      if (/^\d+$/.test(String(form.id))) {
        await nailService.delete(form.id);
      }
      toast.success("Đã xóa dịch vụ");
      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa dịch vụ.");
    }
  }

  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={service === "new" ? "Thêm dịch vụ" : form.name}
      eyebrow="Chi tiết & chỉnh sửa"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          {service !== "new" && (
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
            form="service-edit"
            className="ml-auto"
          >
            Lưu dịch vụ
          </Button>
        </div>
      }
    >
      <form
        id="service-edit"
        onSubmit={handleSave}
        noValidate
        className="space-y-6"
      >
        <Field label="Tên dịch vụ *">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Danh mục *">
          <AdminSelect
            value={String(form.categoryId || "")}
            onChange={(e) => set("categoryId", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </AdminSelect>
        </Field>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Giá (₫) *">
            <Input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </Field>
          <Field label="Thời lượng (phút) *">
            <Input
              type="number"
              min={1}
              step={1}
              value={form.durationMin}
              onChange={(e) => set("durationMin", Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Mô tả ngắn">
          <Textarea
            value={form.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
        </Field>
        <Field label="Mô tả chi tiết">
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Nội dung bao gồm (mỗi dòng một mục)">
          <Textarea
            value={form.includes.join("\n")}
            onChange={(e) => set("includes", e.target.value.split("\n"))}
          />
        </Field>
        <Toggle
          label="Đang hoạt động"
          checked={form.active}
          onChange={(v) => set("active", v)}
        />
        <Toggle
          label="Hiển thị nổi bật"
          checked={form.featured}
          onChange={(v) => set("featured", v)}
        />
        <p className="text-xs leading-relaxed text-paper/40">
          Chỉnh giá hoặc thời lượng chỉ áp dụng cho lịch mới. Lịch đã đặt giữ
          nguyên thông tin tại thời điểm đặt.
        </p>
        <Link className={linkClass} href={`/services/${form.slug}`}>
          Xem trên website
        </Link>
        <FormError message={error} />
      </form>
    </RightDrawer>
  );
}
