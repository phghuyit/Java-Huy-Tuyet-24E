"use client";
import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/format";
import { TODAY, formatMediumDate } from "@/lib/clock";
import { couponService, categoryService, nailService } from "@/services";
import { AdminPage, Panel } from "./layout-kit";
import { FormError } from "./form-kit";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { RightDrawer } from "@/components/ui/right-drawer";

export function PromotionsWorkspace() {
  const [coupons, setCoupons] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [services, setServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(null);

  const loadData = React.useCallback(async () => {
    try {
      const [cRes, catRes, svcRes] = await Promise.allSettled([
        couponService.getAll(),
        categoryService.getAll(),
        nailService.getAll(),
      ]);
      if (cRes.status === "fulfilled" && Array.isArray(cRes.value)) {
        setCoupons(cRes.value.map(c => {
          const discountVal = Number(c.discountValue || c.discount || 0);
          const minOrder = Number(c.minOrderValue || 0);
          const start = (c.startAt || c.startDate || "").slice(0, 10) || TODAY;
          const end = (c.endAt || c.endDate || "").slice(0, 10) || "2026-12-31";
          const catSlugs = c.categorySlugs || [];
          const svcIds = c.serviceIds || [];
          const isAll = catSlugs.length === 0 && svcIds.length === 0;

          return {
            id: String(c.id),
            code: c.code,
            title: c.name || c.description || c.code,
            description: c.description || "",
            discount: discountVal,
            discountType: "fixed",
            minOrderValue: minOrder,
            startDate: start,
            endDate: end,
            active: c.active !== false && c.status !== "INACTIVE",
            redemptions: Number(c.usedCount || c.usageCount || c.redemptions || 0),
            applyScope: isAll ? "all" : "specific",
            categorySlugs: catSlugs,
            serviceIds: svcIds,
          };
        }));
      }
      if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) {
        setCategories(catRes.value);
      }
      if (svcRes.status === "fulfilled" && Array.isArray(svcRes.value)) {
        setServices(svcRes.value);
      }
    } catch (err) {
      console.error("Failed to load promotions workspace data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const rows = [...coupons].sort(
    (x, y) =>
      Number(x.active) - Number(y.active) ||
      x.endDate.localeCompare(y.endDate),
  );
  const live = rows.filter((item) => item.active && item.endDate >= TODAY && item.startDate <= TODAY);
  const given = rows.reduce(
    (sum, item) => sum + (item.redemptions * item.discount),
    0,
  );

  async function toggleStatus(promo) {
    try {
      const nextActive = !promo.active;
      await couponService.update(promo.id, {
        code: promo.code,
        name: promo.title,
        discountType: "FIXED",
        discountValue: promo.discount,
        minOrderValue: promo.minOrderValue || 0,
        startAt: `${promo.startDate}T00:00:00`,
        endAt: `${promo.endDate}T23:59:59`,
        active: nextActive,
      }).catch(() => {});
      setCoupons(prev => prev.map(p => p.id === promo.id ? { ...p, active: nextActive } : p));
      toast.success(nextActive ? "Đã bật mã giảm giá" : "Đã tạm dừng mã giảm giá");
    } catch {
      toast.error("Không cập nhật được trạng thái.");
    }
  }

  async function deletePromo(id) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;
    try {
      await couponService.delete(id).catch(() => {});
      setCoupons(prev => prev.filter(p => p.id !== id));
      toast.success("Đã xóa mã giảm giá");
    } catch {
      toast.error("Không xóa được mã.");
    }
  }

  return (
    <AdminPage
      eyebrow="VELA · Ưu đãi"
      title="Khuyến mãi"
      description="Quản lý mã giảm giá trực tiếp theo số tiền (₫) và giá trị đơn tối thiểu. Giảm tiền cố định khi khách đặt lịch."
      actions={
        <Button variant="champagne" onClick={() => setEditing("new")}>
          Thêm mã
        </Button>
      }
    >
      <div className="mb-10 grid grid-cols-2 border-y border-paper/10 md:grid-cols-3">
        <Metric label="Đang chạy" value={String(live.length)} />
        <Metric label="Tổng số mã" value={String(rows.length)} />
        <Metric label="Đã giảm cho khách" value={currency(given)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((promotion) => {
          const running = promotion.active && promotion.endDate >= TODAY && promotion.startDate <= TODAY;
          const expired = promotion.endDate < TODAY;
          const scheduled = promotion.startDate > TODAY;
          return (
            <Panel key={promotion.id} title={promotion.title}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-3xl tabular text-champagne">
                  {promotion.code}
                </p>
                <span
                  className={cn(
                    "border px-2 py-0.5 text-[0.625rem] uppercase tracking-[0.15em]",
                    running
                      ? "border-signal-live/50 text-signal-live"
                      : "border-paper/20 text-paper/40",
                  )}
                >
                  {running
                    ? "Đang chạy"
                    : !promotion.active
                      ? "Đã tắt"
                      : expired
                        ? "Hết hạn"
                        : scheduled
                          ? "Chưa tới ngày"
                          : "Ngừng"}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-paper/85">
                  Bớt {currency(promotion.discount)}
                </p>
                {promotion.minOrderValue > 0 ? (
                  <p className="text-xs text-champagne/80">
                    Đơn tối thiểu: {currency(promotion.minOrderValue)}
                  </p>
                ) : (
                  <p className="text-xs text-paper/45">
                    Không giới hạn đơn tối thiểu
                  </p>
                )}
              </div>

              {promotion.description ? (
                <p className="mt-2 text-xs leading-relaxed text-paper/50">
                  {promotion.description}
                </p>
              ) : null}

              <dl className="mt-5 space-y-2 border-t border-paper/10 pt-4 text-xs">
                <Row label="Hiệu lực">
                  {formatMediumDate(promotion.startDate)} – {formatMediumDate(promotion.endDate)}
                </Row>
                <Row label="Áp dụng">
                  {promotion.applyScope === "all" || (!promotion.serviceIds?.length && !promotion.categorySlugs?.length)
                    ? "Tất cả dịch vụ"
                    : scopeLabel(promotion, categories, services)}
                </Row>
                <Row label="Đã dùng">
                  {promotion.redemptions} lượt
                </Row>
              </dl>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghostLight"
                  onClick={() => toggleStatus(promotion)}
                >
                  {promotion.active ? "Tắt" : "Bật"}
                </Button>
                <Button
                  size="sm"
                  variant="ghostLight"
                  onClick={() => setEditing(promotion)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  size="sm"
                  variant="ghostLight"
                  className="text-signal-stop hover:text-signal-stop"
                  onClick={() => deletePromo(promotion.id)}
                >
                  Xóa
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>

      {editing ? (
        <PromotionEditor
          key={typeof editing === "string" ? editing : editing.id}
          promotion={editing}
          categories={categories}
          services={services}
          onClose={() => setEditing(null)}
          onSaved={() => {
            loadData();
            setEditing(null);
          }}
        />
      ) : null}
    </AdminPage>
  );
}

function scopeLabel(promotion, categories = [], services = []) {
  if (promotion.serviceIds && promotion.serviceIds.length) {
    return promotion.serviceIds
      .map((id) => services.find((item) => String(item.id) === String(id))?.name ?? id)
      .join(", ");
  }
  if (promotion.categorySlugs && promotion.categorySlugs.length) {
    return promotion.categorySlugs
      .map(
        (slug) =>
          categories.find((item) => item.slug === slug || String(item.id) === String(slug))?.name ?? slug,
      )
      .join(", ");
  }
  return "Tất cả dịch vụ";
}

function Metric({ label, value }) {
  return (
    <dl className="border-b border-paper/10 px-4 py-6 md:border-b-0">
      <dt className="text-xs text-paper/50">{label}</dt>
      <dd className="mt-4 break-words font-display text-3xl tabular text-champagne">
        {value}
      </dd>
    </dl>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap justify-between gap-3">
      <dt className="text-paper/40">{label}</dt>
      <dd className="max-w-[60%] text-right text-paper/70">{children}</dd>
    </div>
  );
}

function PromotionEditor({ promotion, categories, services, onClose, onSaved }) {
  const [form, setForm] = React.useState(() =>
    promotion === "new"
      ? {
          id: `coupon-${Date.now()}`,
          title: "",
          code: "",
          description: "",
          discount: 50000,
          minOrderValue: 0,
          discountType: "fixed",
          startDate: TODAY,
          endDate: "2026-12-31",
          applyScope: "all",
          serviceIds: [],
          categorySlugs: [],
          active: true,
          redemptions: 0,
        }
      : {
          ...promotion,
          minOrderValue: promotion.minOrderValue || 0,
          applyScope: promotion.applyScope || (promotion.serviceIds?.length || promotion.categorySlugs?.length ? "specific" : "all"),
        },
  );
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    if (!form.code.trim()) {
      setError("Vui lòng nhập mã giảm giá.");
      return;
    }
    const discount = Number(form.discount || 0);
    const minOrder = Number(form.minOrderValue || 0);
    if (!form.discount || discount <= 0) {
      setError("Vui lòng nhập số tiền giảm lớn hơn 0.");
      return;
    }
    if (discount > minOrder) {
      setError("Giá trị giảm giá không được lớn hơn giá trị đơn hàng tối thiểu.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.title || form.code,
        description: form.description || "",
        discountType: "FIXED",
        discountValue: Number(form.discount),
        minOrderValue: Number(form.minOrderValue || 0),
        startAt: form.startDate ? `${form.startDate}T00:00:00` : null,
        endAt: form.endDate ? `${form.endDate}T23:59:59` : null,
        active: Boolean(form.active),
        categorySlugs: form.applyScope === "all" ? [] : form.categorySlugs,
        serviceIds: form.applyScope === "all" ? [] : form.serviceIds,
      };

      if (promotion === "new") {
        await couponService.create(payload);
      } else {
        await couponService.update(promotion.id, payload);
      }
      toast.success("Đã lưu mã giảm giá");
      if (typeof onSaved === "function") {
        onSaved();
      }
    } catch (cause) {
      setError(cause?.response?.data?.message || cause?.message || "Không lưu được.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RightDrawer
      open
      onOpenChange={(open) => !open && onClose()}
      title={promotion === "new" ? "Thêm mã giảm giá" : form.code}
      eyebrow="Khuyến mãi"
      footer={
        <Button variant="champagne" type="submit" form="promo-edit" disabled={saving}>
          {saving ? "Đang lưu…" : "Lưu mã"}
        </Button>
      }
    >
      <form
        id="promo-edit"
        noValidate
        className="space-y-6"
        onSubmit={submit}
      >
        <Field label="Mã *" hint="Khách gõ chuỗi này ở bước xác nhận đặt lịch.">
          <Input
            value={form.code}
            placeholder="Ví dụ: VELA50K"
            onChange={(event) => set("code", event.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Tên chương trình *">
          <Input
            value={form.title}
            placeholder="Ví dụ: Giảm 50.000₫ cho đơn từ 200.000₫"
            onChange={(event) => set("title", event.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Số tiền giảm (₫) *">
            <Input
              type="number"
              min={1000}
              step={1000}
              placeholder="50000"
              value={form.discount}
              onChange={(event) => set("discount", Number(event.target.value))}
            />
          </Field>
          <Field label="Đơn tối thiểu (₫)" hint="Phải lớn hơn hoặc bằng số tiền giảm">
            <Input
              type="number"
              min={0}
              step={10000}
              placeholder="0"
              value={form.minOrderValue}
              onChange={(event) => set("minOrderValue", Number(event.target.value))}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Ngày bắt đầu *">
            <Input
              type="date"
              value={form.startDate}
              onChange={(event) => set("startDate", event.target.value)}
            />
          </Field>
          <Field label="Ngày kết thúc *">
            <Input
              type="date"
              value={form.endDate}
              onChange={(event) => set("endDate", event.target.value)}
            />
          </Field>
        </div>

        <Field label="Mô tả">
          <Textarea
            rows={2}
            placeholder="Ghi chú điều kiện áp dụng cho khách hàng..."
            value={form.description}
            onChange={(event) => set("description", event.target.value)}
          />
        </Field>

        <div className="border-t border-paper/10 pt-5 space-y-4">
          <label className="block text-sm font-medium text-paper">
            Phạm vi áp dụng *
          </label>
          <div className="flex items-center gap-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="applyScope"
                value="all"
                checked={form.applyScope === "all"}
                onChange={() => set("applyScope", "all")}
                className="size-4 accent-champagne"
              />
              <span>Tất cả dịch vụ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="applyScope"
                value="specific"
                checked={form.applyScope === "specific"}
                onChange={() => set("applyScope", "specific")}
                className="size-4 accent-champagne"
              />
              <span>Chọn theo danh mục / dịch vụ</span>
            </label>
          </div>
        </div>

        {form.applyScope === "specific" && (
          <div className="space-y-5 border border-paper/10 bg-paper/[0.02] p-4">
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-paper/60 mb-2">
                Áp dụng cho danh mục
              </legend>
              <div className="space-y-1">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 py-1.5 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-champagne"
                      checked={form.categorySlugs.includes(category.slug || String(category.id))}
                      onChange={(event) =>
                        set(
                          "categorySlugs",
                          event.target.checked
                            ? [...form.categorySlugs, category.slug || String(category.id)]
                            : form.categorySlugs.filter(
                                (slug) => slug !== (category.slug || String(category.id)),
                              ),
                        )
                      }
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="border-t border-paper/10 pt-4">
              <legend className="text-xs font-semibold uppercase tracking-wider text-paper/60 mb-1">
                Hoặc chỉ định dịch vụ cụ thể
              </legend>
              <p className="mb-2 text-xs text-paper/40">
                Chỉ áp dụng khi khách đặt một trong các dịch vụ đã chọn.
              </p>
              <div className="thin-scrollbar max-h-48 overflow-y-auto space-y-1">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-3 py-1.5 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 accent-champagne"
                      checked={form.serviceIds.includes(String(service.id))}
                      onChange={(event) =>
                        set(
                          "serviceIds",
                          event.target.checked
                            ? [...form.serviceIds, String(service.id)]
                            : form.serviceIds.filter((id) => id !== String(service.id)),
                        )
                      }
                    />
                    <span>{service.name}</span>
                    <span className="text-xs text-paper/40">({currency(service.price)})</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        <label className="flex items-center gap-3 border-t border-paper/10 pt-5 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="size-4 accent-champagne"
            checked={form.active}
            onChange={(event) => set("active", event.target.checked)}
          />
          <span className="font-medium text-paper">Đang bật mã giảm giá</span>
        </label>

        <p className="text-xs leading-relaxed text-paper/40">
          * Giảm giá tính trực tiếp bằng tiền mặt (₫), không chia tỷ lệ % nhằm đảm bảo tính đơn giản và minh bạch cho khách hàng và salon.
        </p>

        <FormError message={error} />
      </form>
    </RightDrawer>
  );
}
