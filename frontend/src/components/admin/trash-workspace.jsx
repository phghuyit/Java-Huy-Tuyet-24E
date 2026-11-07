"use client";
import * as React from "react";
import { toast } from "sonner";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Package,
  Scissors,
  Tags,
  FileText,
  ChevronDown,
} from "lucide-react";
import { trashService, productService } from "@/services";
import { AdminPage } from "./layout-kit";
import { Button } from "@/components/ui/button";

const CATEGORY_OPTIONS = [
  { value: "all", label: "Toàn bộ đã xóa gần nhất (Mặc định)", icon: Filter },
  { value: "inventory", label: "Kho sơn gel & Vật tư", icon: Package },
  { value: "service", label: "Dịch vụ nail & Spa", icon: Scissors },
  { value: "category", label: "Danh mục", icon: Tags },
  { value: "other", label: "Mục khác", icon: FileText },
];

export function TrashWorkspace() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [submittingId, setSubmittingId] = React.useState(null);

  const loadTrash = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await trashService.getAll(categoryFilter);
      setItems(data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  React.useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const handleRestore = async (item) => {
    setSubmittingId(item.id);
    try {
      await trashService.restore(item.id);

      if (item.category === "inventory" && item.data) {
        try {
          await productService.create({
            name: item.data.name,
            sku: item.data.sku,
            unit: item.data.unit || "Chai",
            costPrice: item.data.costPrice || 0,
            salePrice: item.data.salePrice || 0,
            stockQuantity: item.data.stockQuantity || 0,
            minStock: item.data.minStock || 5,
            isForSale: item.data.isForSale ?? true,
            status: "ACTIVE",
          });
        } catch (_) {}
      }

      toast.success(`Đã khôi phục "${item.name}" thành công!`);
      loadTrash();
    } catch (err) {
      toast.error("Không thể khôi phục mục này.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handlePermanentDelete = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN "${item.name}"? Thao tác này không thể hoàn tác!`)) {
      return;
    }
    setSubmittingId(item.id);
    try {
      await trashService.permanentDelete(item.id);
      if (item.category === "inventory" && item.originalId) {
        try {
          await productService.delete(item.originalId);
        } catch (_) {}
      }
      toast.success(`Đã xóa vĩnh viễn "${item.name}"!`);
      loadTrash();
    } catch (err) {
      toast.error("Không thể xóa vĩnh viễn.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEmptyTrash = async () => {
    const targetLabel =
      categoryFilter === "all"
        ? "toàn bộ thùng rác"
        : CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)?.label || "các mục này";

    if (!window.confirm(`Bạn có chắc chắn muốn DỌN SẠCH ${targetLabel}? Mọi dữ liệu đã chọn sẽ bị xóa vĩnh viễn!`)) {
      return;
    }

    try {
      await trashService.emptyTrash(categoryFilter);
      toast.success("Đã dọn sạch thùng rác thành công.");
      loadTrash();
    } catch {
      toast.error("Không thể dọn sạch thùng rác.");
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      item.name?.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.deletedBy?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminPage
      eyebrow="Hệ thống · VELA"
      title="Thùng rác tổng"
      description="Xem và quản lý toàn bộ các mục đã xóa gần nhất trong hệ thống. Bạn có thể khôi phục lại dữ liệu bất cứ lúc nào hoặc xóa vĩnh viễn."
      actions={
        <div className="flex flex-wrap gap-2">
          {items.length > 0 && (
            <Button variant="danger" onClick={handleEmptyTrash}>
              <Trash2 className="size-4" /> Dọn sạch thùng rác
            </Button>
          )}
          <Button variant="ghostLight" onClick={loadTrash}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Tải lại
          </Button>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[280px]">
            <label htmlFor="trash-category" className="sr-only">
              Lọc theo danh mục
            </label>
            <div className="relative">
              <select
                id="trash-category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none border border-champagne/40 bg-void px-4 py-2.5 pr-10 text-sm font-medium text-paper focus:border-champagne focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-void text-paper">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-champagne" />
            </div>
          </div>

          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/40" />
            <input
              type="text"
              placeholder="Tìm theo tên mục đã xóa, mã SKU, người xóa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-paper/15 bg-transparent py-2.5 pl-9 pr-3 text-sm text-paper placeholder:text-paper/40 focus:border-champagne focus:outline-none"
            />
          </div>
        </div>

        <p className="text-xs text-paper/50">
          Đang hiển thị: <strong className="text-champagne">{filteredItems.length}</strong> mục
        </p>
      </div>

      <div className="overflow-x-auto border border-paper/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-paper/10 bg-paper/[0.03] text-xs uppercase tracking-wider text-paper/50">
            <tr>
              <th className="px-5 py-4">Tên mục / Dữ liệu</th>
              <th className="px-5 py-4">Phân loại danh mục</th>
              <th className="px-5 py-4">Người thực hiện xóa</th>
              <th className="px-5 py-4">Thời gian xóa</th>
              <th className="px-5 py-4 text-right">Thao tác xử lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-paper/10">
            {filteredItems.map((item) => {
              const isSubmitting = submittingId === item.id;
              const formattedDate = item.deletedAt
                ? new Date(item.deletedAt).toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—";

              return (
                <tr key={item.id} className="transition-colors hover:bg-paper/[0.02]">
                  <td className="px-5 py-4">
                    <p className="font-medium text-paper">{item.name}</p>
                    <p className="mt-0.5 text-xs text-paper/40">
                      {item.sku ? `Mã: ${item.sku} · ` : ""}
                      {item.details || ""}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded border border-paper/20 bg-paper/[0.05] px-2.5 py-1 text-xs text-paper/80">
                      {item.category === "inventory" ? (
                        <Package className="size-3 text-champagne" />
                      ) : item.category === "service" ? (
                        <Scissors className="size-3 text-sky-400" />
                      ) : (
                        <Tags className="size-3 text-emerald-400" />
                      )}
                      {item.categoryLabel || "Khác"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-paper/70">
                    {item.deletedBy || "Quản trị viên"}
                  </td>
                  <td className="px-5 py-4 text-xs font-mono text-paper/50">
                    {formattedDate}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outlineLight"
                        disabled={isSubmitting}
                        onClick={() => handleRestore(item)}
                      >
                        <RotateCcw className="size-3.5 text-emerald-400" /> Khôi phục
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={isSubmitting}
                        onClick={() => handlePermanentDelete(item)}
                      >
                        <Trash2 className="size-3.5" /> Xóa vĩnh viễn
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-paper/40">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Trash2 className="size-8 text-paper/20" />
                    <p className="text-sm">Thùng rác hiện đang trống trong danh mục này.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}
