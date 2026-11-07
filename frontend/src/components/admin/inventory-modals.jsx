"use client";
import * as React from "react";
import { Package, X, Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/format";

export function EditProductModal({
  isOpen,
  onClose,
  form,
  setForm,
  selectedProduct,
  onSubmit,
  submitting,
  operatorName,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-lg border border-paper/15 bg-night-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper/10 pb-4">
          <div>
            <h3 className="font-sans text-lg font-medium text-paper">
              Chỉnh sửa sản phẩm & Điều chỉnh kho
            </h3>
            <p className="mt-0.5 text-xs text-paper/50">
              Mã SKU: <span className="font-mono text-champagne">{form.sku}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-paper/40 hover:text-paper">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-wider text-paper/60">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-paper/60">
                Mã SKU *
              </label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm font-mono text-paper focus:border-champagne focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-paper/60">
                Đơn vị tính
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs uppercase tracking-wider text-paper/60">
                Đơn giá vốn nhập (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-paper/40">
                * Sản phẩm này dùng cho quản lý tiêu hao nội bộ salon, không có giá bán lẻ.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-champagne/20 bg-champagne/[0.03] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-champagne">
                Quản lý số lượng tồn kho
              </span>
              <span className="text-xs text-paper/50">
                Hiện có: <b className="text-paper">{selectedProduct?.stockQuantity || 0}</b> {form.unit}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs text-paper/70">Số lượng tồn kho mới:</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                  className="mt-1 w-full rounded border border-champagne/30 bg-night-surface px-3 py-2 text-sm font-semibold text-champagne focus:border-champagne focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-paper/70">Định mức tối thiểu (cảnh báo):</label>
                <input
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs text-paper/70">
                Lý do thay đổi số lượng / ghi chú audit log:
              </label>
              <input
                type="text"
                placeholder="VD: Kiểm kê định kỳ, nhập thêm hàng OPI, vỡ chai..."
                value={form.adjustReason}
                onChange={(e) => setForm({ ...form, adjustReason: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-xs text-paper placeholder-paper/30 focus:border-champagne focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-paper/40">
                * Thao tác sẽ được lưu vào lịch sử kho với người thực hiện:{" "}
                <span className="text-champagne">{operatorName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-paper/10 pt-4">
            <Button type="button" variant="ghostLight" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="gold" disabled={submitting}>
              {submitting ? "Đang lưu…" : "Lưu thay đổi & Ghi nhận"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DetailProductModal({
  product,
  onClose,
  transactions = [],
  onOpenEdit,
}) {
  if (!product) return null;

  const productTxs = transactions.filter(
    (tx) => String(tx.productId) === String(product.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg border border-paper/15 bg-night-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-champagne/10 text-champagne">
              <Package className="size-5" />
            </div>
            <div>
              <h3 className="font-sans text-lg font-medium text-paper">{product.name}</h3>
              <span className="font-mono text-xs text-champagne">SKU: {product.sku}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-paper/40 hover:text-paper">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded border border-paper/10 bg-night-surface p-3">
            <span className="text-xs text-paper/50">Tồn kho hiện tại</span>
            <p className="mt-1 text-lg font-semibold text-champagne">
              {product.stockQuantity || 0} {product.unit || "chai"}
            </p>
          </div>
          <div className="rounded border border-paper/10 bg-night-surface p-3">
            <span className="text-xs text-paper/50">Định mức cảnh báo</span>
            <p className="mt-1 text-lg font-semibold text-amber-400">
              {product.minStock || 5} {product.unit || "chai"}
            </p>
          </div>
          <div className="rounded border border-paper/10 bg-night-surface p-3">
            <span className="text-xs text-paper/50">Đơn giá vốn nhập</span>
            <p className="mt-1 text-sm font-medium text-paper">
              {product.costPrice ? currency(product.costPrice) : "—"}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between border-b border-paper/10 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-paper/70">
              <Clock className="size-3.5 text-champagne" />
              Lịch sử xuất nhập của sản phẩm này
            </span>
          </div>

          <div className="mt-3 max-h-56 overflow-y-auto space-y-2 pr-1">
            {productTxs.length === 0 ? (
              <p className="py-6 text-center text-xs text-paper/40">
                Chưa có phát sinh giao dịch nào cho mã sản phẩm này.
              </p>
            ) : (
              productTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded border border-paper/5 bg-night-surface p-2.5 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          tx.type === "IMPORT"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : tx.type === "EXPORT"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-sky-500/10 text-sky-400"
                        }`}
                      >
                        {tx.type}
                      </span>
                      <span className="font-semibold text-paper">
                        {tx.delta > 0 ? `+${tx.delta}` : tx.delta} {product.unit}
                      </span>
                      <span className="text-paper/40">(Còn: {tx.afterQty})</span>
                    </div>
                    <p className="mt-1 text-[11px] text-paper/60">
                      {tx.note || "Không có ghi chú"}
                    </p>
                  </div>

                  <div className="text-right text-[11px]">
                    <span className="text-paper/40">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString("vi-VN") : ""}
                    </span>
                    <p className="text-champagne/80 font-medium">{tx.operator}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-paper/10 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const p = product;
              onClose();
              onOpenEdit(p);
            }}
          >
            <Pencil className="mr-1.5 size-3.5" />
            Chỉnh sửa sản phẩm
          </Button>
          <Button variant="ghostLight" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CreateProductModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-paper/15 bg-night-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper/10 pb-4">
          <h3 className="font-sans text-lg font-medium text-paper">Thêm sản phẩm kho mới</h3>
          <button onClick={onClose} className="text-paper/40 hover:text-paper">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-paper/60">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Sơn gel đính đá VELA Diamond"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-paper/60">Mã SKU *</label>
              <input
                type="text"
                required
                placeholder="VD: GEL-DM-01"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm font-mono text-paper focus:border-champagne focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-paper/60">Đơn vị tính</label>
              <input
                type="text"
                placeholder="Chai, Lọ, Bộ..."
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-paper/60">
              Đơn giá vốn nhập (VNĐ)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-paper/40">
              * Sản phẩm dùng cho quản lý tiêu hao nội bộ tại salon (không có giá bán lẻ).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-paper/60">
                Số lượng nhập ban đầu
              </label>
              <input
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-paper/60">
                Định mức tối thiểu
              </label>
              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="mt-1 w-full rounded border border-paper/20 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-paper/10 pt-4">
            <Button type="button" variant="ghostLight" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="gold" disabled={submitting}>
              {submitting ? "Đang tạo…" : "Tạo sản phẩm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteProductModal({ candidate, onClose, onConfirm, submitting }) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-paper/15 bg-night-card p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-400">
          <Trash2 className="size-6" />
          <h3 className="font-sans text-lg font-medium text-paper">Chuyển vào Thùng rác tổng?</h3>
        </div>
        <p className="mt-3 text-sm text-paper/70">
          Bạn có chắc chắn muốn xóa sản phẩm <b className="text-paper">{candidate.name}</b> (SKU:{" "}
          {candidate.sku})?
        </p>
        <p className="mt-2 text-xs text-paper/50">
          Sản phẩm sẽ được đưa vào <b>Thùng rác tổng</b>. Bạn có thể khôi phục lại bất cứ lúc nào hoặc
          xóa vĩnh viễn trong trang Thùng rác.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="ghostLight" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button variant="danger" disabled={submitting} onClick={onConfirm}>
            {submitting ? "Đang xử lý…" : "Chuyển vào Thùng rác"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BatchImportModal({
  isOpen,
  onClose,
  products = [],
  importDraft,
  setImportDraft,
  onConfirm,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-paper/15 bg-night-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper/10 pb-4">
          <div>
            <h3 className="font-sans text-lg font-medium text-paper">Nhập kho hàng loạt</h3>
            <p className="mt-0.5 text-xs text-paper/50">
              Nhập số lượng bổ sung cho từng loại sơn gel & vật tư
            </p>
          </div>
          <button onClick={onClose} className="text-paper/40 hover:text-paper">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded border border-paper/10 bg-paper/[0.02] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-paper">{p.name}</p>
                  <p className="mt-0.5 text-xs text-paper/45">
                    Mã: {p.sku} · Hiện có:{" "}
                    <span className="text-champagne">{p.stockQuantity || 0}</span> {p.unit || "chai"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-paper/50">+</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={importDraft[p.id] || ""}
                    onChange={(e) =>
                      setImportDraft({
                        ...importDraft,
                        [p.id]: e.target.value,
                      })
                    }
                    className="w-20 border border-paper/20 bg-transparent px-3 py-1.5 text-right text-sm text-paper focus:border-champagne focus:outline-none"
                  />
                  <span className="text-xs text-paper/50">{p.unit || "chai"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-paper/10 pt-4">
          <Button variant="ghostLight" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button variant="gold" disabled={submitting} onClick={onConfirm}>
            {submitting ? "Đang xử lý…" : "Xác nhận nhập kho"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BatchExportModal({
  isOpen,
  onClose,
  products = [],
  exportDraft,
  setExportDraft,
  onConfirm,
  submitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-paper/15 bg-night-card p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-paper/10 pb-4">
          <div>
            <h3 className="font-sans text-lg font-medium text-paper">Xuất kho sử dụng hàng loạt</h3>
            <p className="mt-0.5 text-xs text-paper/50">
              Xuất vật tư giao cho các bàn làm nail hoặc kỹ thuật viên
            </p>
          </div>
          <button onClick={onClose} className="text-paper/40 hover:text-paper">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded border border-paper/10 bg-paper/[0.02] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-paper">{p.name}</p>
                  <p className="mt-0.5 text-xs text-paper/45">
                    Mã: {p.sku} · Hiện có:{" "}
                    <span className="text-champagne">{p.stockQuantity || 0}</span> {p.unit || "chai"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-paper/50">-</span>
                  <input
                    type="number"
                    min="0"
                    max={p.stockQuantity || 0}
                    placeholder="0"
                    value={exportDraft[p.id] || ""}
                    onChange={(e) =>
                      setExportDraft({
                        ...exportDraft,
                        [p.id]: e.target.value,
                      })
                    }
                    className="w-20 border border-paper/20 bg-transparent px-3 py-1.5 text-right text-sm text-paper focus:border-champagne focus:outline-none"
                  />
                  <span className="text-xs text-paper/50">{p.unit || "chai"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-paper/10 pt-4">
          <Button variant="ghostLight" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button variant="danger" disabled={submitting} onClick={onConfirm}>
            {submitting ? "Đang xử lý…" : "Xác nhận xuất kho"}
          </Button>
        </div>
      </div>
    </div>
  );
}
