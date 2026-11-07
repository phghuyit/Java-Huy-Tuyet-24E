"use client";
import * as React from "react";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  SlidersHorizontal,
  UserCheck,
} from "lucide-react";
import { productService, inventoryService, trashService } from "@/services";
import { AdminPage } from "./layout-kit";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/format";
import { useAuth } from "@/lib/auth-store";
import { Pagination } from "./workspace";
import {
  EditProductModal,
  DetailProductModal,
  CreateProductModal,
  DeleteProductModal,
  BatchImportModal,
  BatchExportModal,
} from "./inventory-modals";

export function InventoryWorkspace() {
  const { session } = useAuth();
  const operatorName = session?.user?.name || session?.user?.email || "Quản trị viên";

  const [activeTab, setActiveTab] = React.useState("products");

  const [products, setProducts] = React.useState([]);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [txTypeFilter, setTxTypeFilter] = React.useState("ALL");

  const [productPage, setProductPage] = React.useState(1);
  const [productPageSize, setProductPageSize] = React.useState(10);
  const [txPage, setTxPage] = React.useState(1);
  const [txPageSize, setTxPageSize] = React.useState(10);

  React.useEffect(() => {
    setProductPage(1);
  }, [search, statusFilter]);

  React.useEffect(() => {
    setTxPage(1);
  }, [search, txTypeFilter]);

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [detailProduct, setDetailProduct] = React.useState(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [deleteCandidate, setDeleteCandidate] = React.useState(null);

  const [editForm, setEditForm] = React.useState({
    id: null,
    sku: "",
    name: "",
    unit: "Chai",
    costPrice: 0,
    stockQuantity: 0,
    minStock: 5,
    status: "ACTIVE",
    adjustReason: "",
  });

  const [createForm, setCreateForm] = React.useState({
    sku: "",
    name: "",
    unit: "Chai",
    costPrice: "",
    stockQuantity: "0",
    minStock: "5",
    status: "ACTIVE",
    note: "Khởi tạo vật tư mới",
  });

  const [importDraft, setImportDraft] = React.useState({});
  const [exportDraft, setExportDraft] = React.useState({});

  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const internalSupplies = data.map((item) => {
          const { salePrice, ...rest } = item;
          return { ...rest, salePrice: 0, isForSale: false };
        });
        setProducts(internalSupplies);
      } else {
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch {
      setProducts([]);
      toast.error("Không thể tải danh sách tồn kho từ máy chủ");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = React.useCallback(async () => {
    try {
      const txs = await inventoryService.getTransactions();
      setTransactions(txs || []);
    } catch {
      setTransactions([]);
    }
  }, []);

  React.useEffect(() => {
    loadProducts();
    loadTransactions();
  }, [loadProducts, loadTransactions]);

  const handleOpenEdit = (product) => {
    setEditForm({
      id: product.id,
      sku: product.sku || "",
      name: product.name || "",
      unit: product.unit || "Chai",
      costPrice: product.costPrice || 0,
      stockQuantity: product.stockQuantity || 0,
      minStock: product.minStock || 5,
      status: product.status || "ACTIVE",
      adjustReason: "",
    });
    setSelectedProduct(product);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.sku) {
      toast.error("Vui lòng nhập tên và mã sản phẩm.");
      return;
    }

    setSubmitting(true);
    try {
      const beforeQty = Number(selectedProduct.stockQuantity) || 0;
      const afterQty = Number(editForm.stockQuantity) || 0;
      const qtyDelta = afterQty - beforeQty;

      const updatedPayload = {
        name: editForm.name,
        sku: editForm.sku,
        unit: editForm.unit,
        costPrice: Number(editForm.costPrice) || 0,
        salePrice: 0,
        isForSale: false,
        stockQuantity: afterQty,
        minStock: Number(editForm.minStock) || 5,
        status: editForm.status,
      };

      try {
        await productService.update(editForm.id, updatedPayload);
      } catch (_) {}

      setProducts((prev) =>
        prev.map((p) => (p.id === editForm.id ? { ...p, ...updatedPayload } : p))
      );

      if (qtyDelta !== 0) {
        const txType = qtyDelta > 0 ? "IN" : "OUT";
        const txNote =
          editForm.adjustReason ||
          (qtyDelta > 0
            ? `Điều chỉnh tăng +${qtyDelta} ${editForm.unit || ""}`
            : `Điều chỉnh giảm ${qtyDelta} ${editForm.unit || ""}`);

        await inventoryService.recordTransaction({
          productId: editForm.id,
          productName: editForm.name,
          sku: editForm.sku,
          type: txType,
          beforeQty,
          afterQty,
          delta: qtyDelta,
          note: txNote,
          operator: operatorName,
        });

        await loadTransactions();
      }

      toast.success("Cập nhật thông tin sản phẩm & ghi nhận lịch sử kho thành công!");
      setIsEditOpen(false);
    } catch {
      toast.error("Không thể lưu thay đổi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.sku) {
      toast.error("Vui lòng nhập tên và mã sản phẩm.");
      return;
    }

    setSubmitting(true);
    try {
      const initialStock = Number(createForm.stockQuantity) || 0;
      const payload = {
        sku: createForm.sku.trim(),
        name: createForm.name.trim(),
        unit: createForm.unit || "Chai",
        costPrice: Number(createForm.costPrice) || 0,
        salePrice: 0,
        isForSale: false,
        stockQuantity: initialStock,
        minStock: Number(createForm.minStock) || 5,
        status: createForm.status || "ACTIVE",
      };

      let newId = Date.now();
      try {
        const res = await productService.create(payload);
        if (res && res.id) newId = res.id;
      } catch (_) {}

      const createdItem = { ...payload, id: newId };
      setProducts((prev) => [createdItem, ...prev]);

      if (initialStock > 0) {
        await inventoryService.recordTransaction({
          productId: newId,
          productName: payload.name,
          sku: payload.sku,
          type: "IMPORT",
          beforeQty: 0,
          afterQty: initialStock,
          delta: initialStock,
          note: createForm.note || "Khởi tạo tồn kho ban đầu",
          operator: operatorName,
        });
        await loadTransactions();
      }

      toast.success(`Đã thêm sản phẩm "${payload.name}" thành công!`);
      setIsCreateOpen(false);
      setCreateForm({
        sku: "",
        name: "",
        unit: "Chai",
        costPrice: "",
        stockQuantity: "0",
        minStock: "5",
        status: "ACTIVE",
        note: "Khởi tạo vật tư mới",
      });
    } catch {
      toast.error("Không thể tạo sản phẩm.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setSubmitting(true);
    try {
      await trashService.moveToTrash({
        item: deleteCandidate,
        category: "inventory",
        title: deleteCandidate.name,
        deletedBy: operatorName,
      });

      try {
        await productService.delete(deleteCandidate.id);
      } catch (_) {}

      setProducts((prev) => prev.filter((p) => p.id !== deleteCandidate.id));

      await inventoryService.recordTransaction({
        productId: deleteCandidate.id,
        productName: deleteCandidate.name,
        sku: deleteCandidate.sku,
        type: "ADJUST",
        beforeQty: deleteCandidate.stockQuantity || 0,
        afterQty: 0,
        delta: -(deleteCandidate.stockQuantity || 0),
        note: `Đã chuyển sản phẩm vào Thùng rác tổng`,
        operator: operatorName,
      });
      await loadTransactions();

      toast.success(`Đã chuyển "${deleteCandidate.name}" vào Thùng rác tổng.`);
      setDeleteCandidate(null);
    } catch {
      toast.error("Không thể xóa sản phẩm.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchImport = async () => {
    const entries = Object.entries(importDraft).filter(([, qty]) => Number(qty) > 0);
    if (entries.length === 0) {
      toast.error("Vui lòng nhập số lượng cho ít nhất 1 sản phẩm.");
      return;
    }

    setSubmitting(true);
    try {
      for (const [idStr, addQty] of entries) {
        const product = products.find((p) => String(p.id) === String(idStr));
        if (product) {
          const delta = Number(addQty);
          const beforeQty = Number(product.stockQuantity) || 0;
          const afterQty = beforeQty + delta;

          try {
            await productService.update(product.id, {
              ...product,
              stockQuantity: afterQty,
            });
          } catch (_) {}

          await inventoryService.recordTransaction({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: "IMPORT",
            beforeQty,
            afterQty,
            delta,
            note: "Nhập hàng theo lô",
            operator: operatorName,
          });
        }
      }

      await loadProducts();
      await loadTransactions();
      toast.success(`Đã nhập kho thành công cho ${entries.length} sản phẩm!`);
      setImportDraft({});
      setIsImportOpen(false);
    } catch {
      toast.error("Xảy ra lỗi khi nhập kho.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchExport = async () => {
    const entries = Object.entries(exportDraft).filter(([, qty]) => Number(qty) > 0);
    if (entries.length === 0) {
      toast.error("Vui lòng nhập số lượng xuất cho ít nhất 1 sản phẩm.");
      return;
    }

    setSubmitting(true);
    try {
      for (const [idStr, subQty] of entries) {
        const product = products.find((p) => String(p.id) === String(idStr));
        if (product) {
          const delta = Number(subQty);
          const beforeQty = Number(product.stockQuantity) || 0;
          const afterQty = Math.max(0, beforeQty - delta);

          try {
            await productService.update(product.id, {
              ...product,
              stockQuantity: afterQty,
            });
          } catch (_) {}

          await inventoryService.recordTransaction({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            type: "EXPORT",
            beforeQty,
            afterQty,
            delta: -delta,
            note: "Xuất kho sử dụng dịch vụ",
            operator: operatorName,
          });
        }
      }

      await loadProducts();
      await loadTransactions();
      toast.success(`Đã xuất kho thành công cho ${entries.length} sản phẩm!`);
      setExportDraft({});
      setIsExportOpen(false);
    } catch {
      toast.error("Xảy ra lỗi khi xuất kho.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      const qty = Number(p.stockQuantity) || 0;
      const min = Number(p.minStock) || 5;

      if (statusFilter === "in_stock") return qty > min;
      if (statusFilter === "low_stock") return qty > 0 && qty <= min;
      if (statusFilter === "out_of_stock") return qty === 0;
      return true;
    });
  }, [products, search, statusFilter]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.productName?.toLowerCase().includes(search.toLowerCase()) ||
        tx.sku?.toLowerCase().includes(search.toLowerCase()) ||
        tx.operator?.toLowerCase().includes(search.toLowerCase()) ||
        tx.note?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      if (txTypeFilter !== "ALL" && tx.type !== txTypeFilter) return false;
      return true;
    });
  }, [transactions, search, txTypeFilter]);

  const totalItems = products.reduce((acc, p) => acc + (Number(p.stockQuantity) || 0), 0);
  const outOfStockCount = products.filter((p) => Number(p.stockQuantity) === 0).length;
  const lowStockCount = products.filter(
    (p) => Number(p.stockQuantity) > 0 && Number(p.stockQuantity) <= (Number(p.minStock) || 5)
  ).length;

  return (
    <AdminPage
      title="Kho sơn gel & Vật tư"
      description="Quản lý tồn kho, chi tiết sản phẩm, điều chỉnh số lượng và tra cứu lịch sử nhập xuất kho"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadProducts();
              loadTransactions();
              toast.info("Đã làm mới dữ liệu kho.");
            }}
          >
            <RefreshCw className="mr-1.5 size-4" />
            Làm mới
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportDraft({});
              setIsImportOpen(true);
            }}
          >
            <Download className="mr-1.5 size-4 text-emerald-400" />
            Nhập hàng loạt
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setExportDraft({});
              setIsExportOpen(true);
            }}
          >
            <Upload className="mr-1.5 size-4 text-amber-400" />
            Xuất hàng loạt
          </Button>

          <Button variant="gold" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" />
            Thêm sản phẩm mới
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-paper/10 bg-night-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-paper/60">
              Tổng mã sản phẩm
            </span>
            <Package className="size-4 text-paper/40" />
          </div>
          <p className="mt-2 font-serif text-2xl font-light text-paper">{products.length}</p>
          <span className="text-xs text-paper/45">Danh mục sơn & phụ liệu</span>
        </div>

        <div className="rounded-lg border border-paper/10 bg-night-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-paper/60">
              Tổng số lượng tồn
            </span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-light text-champagne">{totalItems}</p>
          <span className="text-xs text-paper/45">Chai / Lọ / Đơn vị hiện có</span>
        </div>

        <div className="rounded-lg border border-paper/10 bg-night-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-paper/60">
              Cảnh báo sắp hết
            </span>
            <AlertTriangle className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-light text-amber-400">{lowStockCount}</p>
          <span className="text-xs text-amber-400/70">Dưới định mức tối thiểu</span>
        </div>

        <div className="rounded-lg border border-paper/10 bg-night-surface p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-paper/60">Đã hết hàng</span>
            <XCircle className="size-4 text-rose-400" />
          </div>
          <p className="mt-2 font-serif text-2xl font-light text-rose-400">{outOfStockCount}</p>
          <span className="text-xs text-rose-400/70">Cần nhập thêm ngay</span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-paper/10">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 pb-3 pt-2 text-sm font-medium transition-colors ${
            activeTab === "products"
              ? "border-b-2 border-champagne text-champagne"
              : "text-paper/60 hover:text-paper"
          }`}
        >
          <Package className="size-4" />
          Danh mục sản phẩm kho ({products.length})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 pb-3 pt-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "border-b-2 border-champagne text-champagne"
              : "text-paper/60 hover:text-paper"
          }`}
        >
          <History className="size-4" />
          Lịch sử nhập xuất kho ({transactions.length})
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-[280px] flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/40" />
          <input
            type="text"
            placeholder={
              activeTab === "products"
                ? "Tìm theo tên sơn, mã SKU..."
                : "Tìm theo tên, SKU, người thực hiện, ghi chú..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-paper/15 bg-night-surface py-2 pl-9 pr-3 text-sm text-paper placeholder-paper/40 focus:border-champagne focus:outline-none"
          />
        </div>

        {activeTab === "products" ? (
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-paper/15 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
            >
              <option value="all">Tất cả tình trạng tồn</option>
              <option value="in_stock">Còn nhiều hàng</option>
              <option value="low_stock">Cảnh báo sắp hết</option>
              <option value="out_of_stock">Đã hết hàng</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value)}
              className="rounded-md border border-paper/15 bg-night-surface px-3 py-2 text-sm text-paper focus:border-champagne focus:outline-none"
            >
              <option value="ALL">Tất cả loại giao dịch</option>
              <option value="IMPORT">Nhập kho (IMPORT)</option>
              <option value="EXPORT">Xuất kho (EXPORT)</option>
              <option value="ADJUST">Điều chỉnh (ADJUST)</option>
              <option value="INFO_UPDATE">Cập nhật thông tin (INFO)</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "products" && (
        <div className="overflow-hidden rounded-lg border border-paper/10 bg-night-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-paper/80">
              <thead className="border-b border-paper/10 bg-paper/[0.02] text-xs uppercase text-paper/50">
                <tr>
                  <th className="px-4 py-3">Mã SKU</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3">Đơn vị</th>
                  <th className="px-4 py-3">Đơn giá nhập (Giá vốn)</th>
                  <th className="px-4 py-3 text-center">Tồn kho</th>
                  <th className="px-4 py-3 text-center">Tình trạng</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-paper/40">
                      Đang tải dữ liệu kho…
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-paper/40">
                      Không tìm thấy sản phẩm nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredProducts
                    .slice((productPage - 1) * productPageSize, productPage * productPageSize)
                    .map((p) => {
                      const qty = Number(p.stockQuantity) || 0;
                      const min = Number(p.minStock) || 5;
                      const isOut = qty === 0;
                      const isLow = qty > 0 && qty <= min;

                      return (
                        <tr key={p.id} className="hover:bg-paper/[0.02]">
                          <td className="px-4 py-3 font-mono text-xs text-champagne/80">
                            {p.sku || `PRD-${p.id}`}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-paper">{p.name}</p>
                            <span className="text-xs text-paper/40">
                              Định mức tối thiểu: {min} {p.unit || "chai"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-paper/70">{p.unit || "Chai"}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-paper">
                              {p.costPrice ? currency(p.costPrice) : "—"}
                            </p>
                            <span className="text-[11px] text-paper/40">Vật tư nội bộ</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-semibold ${
                                isOut
                                  ? "text-rose-400"
                                  : isLow
                                  ? "text-amber-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {qty}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isOut ? (
                              <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-xs text-rose-400">
                                Hết hàng
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                                Sắp hết ({qty}/{min})
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                                Đủ hàng
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setDetailProduct(p)}
                                title="Xem chi tiết & lịch sử"
                                className="rounded p-1.5 text-paper/60 hover:bg-paper/10 hover:text-paper"
                              >
                                <Eye className="size-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(p)}
                                title="Chỉnh sửa thông tin & số lượng"
                                className="rounded p-1.5 text-paper/60 hover:bg-paper/10 hover:text-champagne"
                              >
                                <Pencil className="size-4" />
                              </button>

                              <button
                                onClick={() => setDeleteCandidate(p)}
                                title="Chuyển vào thùng rác"
                                className="rounded p-1.5 text-paper/60 hover:bg-rose-500/10 hover:text-rose-400"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-paper/10">
            <Pagination
              page={productPage}
              pageSize={productPageSize}
              totalItems={filteredProducts.length}
              onPageChange={setProductPage}
              onPageSizeChange={setProductPageSize}
              itemLabel="sản phẩm"
            />
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="overflow-hidden rounded-lg border border-paper/10 bg-night-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-paper/80">
              <thead className="border-b border-paper/10 bg-paper/[0.02] text-xs uppercase text-paper/50">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Loại giao dịch</th>
                  <th className="px-4 py-3 text-center">Biến động</th>
                  <th className="px-4 py-3 text-center">Tồn sau GD</th>
                  <th className="px-4 py-3">Lý do / Ghi chú</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper/5">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-paper/40">
                      Chưa có lịch sử giao dịch kho nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions
                    .slice((txPage - 1) * txPageSize, txPage * txPageSize)
                    .map((tx) => {
                      const isImport = tx.type === "IMPORT";
                      const isExport = tx.type === "EXPORT";
                      const isAdjust = tx.type === "ADJUST";

                      return (
                        <tr key={tx.id} className="hover:bg-paper/[0.02]">
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-paper/60">
                            {tx.createdAt
                              ? new Date(tx.createdAt).toLocaleString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-paper">{tx.productName}</p>
                            <span className="font-mono text-xs text-champagne/70">{tx.sku}</span>
                          </td>
                          <td className="px-4 py-3">
                            {isImport && (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                                <ArrowDownLeft className="size-3" />
                                Nhập kho
                              </span>
                            )}
                            {isExport && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                                <ArrowUpRight className="size-3" />
                                Xuất kho
                              </span>
                            )}
                            {isAdjust && (
                              <span className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400">
                                <SlidersHorizontal className="size-3" />
                                Điều chỉnh
                              </span>
                            )}
                            {!isImport && !isExport && !isAdjust && (
                              <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-purple-400">
                                Cập nhật TT
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-semibold ${
                                tx.delta > 0
                                  ? "text-emerald-400"
                                  : tx.delta < 0
                                  ? "text-rose-400"
                                  : "text-paper/40"
                              }`}
                            >
                              {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-medium text-paper">
                            {tx.afterQty}
                          </td>
                          <td className="max-w-xs px-4 py-3 text-xs text-paper/70">
                            {tx.note || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex items-center gap-1.5 text-paper/80">
                              <UserCheck className="size-3 text-champagne" />
                              <span>{tx.operator || "Hệ thống"}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-paper/10">
            <Pagination
              page={txPage}
              pageSize={txPageSize}
              totalItems={filteredTransactions.length}
              onPageChange={setTxPage}
              onPageSizeChange={setTxPageSize}
              itemLabel="giao dịch"
            />
          </div>
        </div>
      )}

      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        form={editForm}
        setForm={setEditForm}
        selectedProduct={selectedProduct}
        onSubmit={handleSaveEdit}
        submitting={submitting}
        operatorName={operatorName}
      />

      <DetailProductModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        transactions={transactions}
        onOpenEdit={handleOpenEdit}
      />

      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={handleCreateProduct}
        submitting={submitting}
      />

      <DeleteProductModal
        candidate={deleteCandidate}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleConfirmDelete}
        submitting={submitting}
      />

      <BatchImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        products={products}
        importDraft={importDraft}
        setImportDraft={setImportDraft}
        onConfirm={handleBatchImport}
        submitting={submitting}
      />

      <BatchExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        products={products}
        exportDraft={exportDraft}
        setExportDraft={setExportDraft}
        onConfirm={handleBatchExport}
        submitting={submitting}
      />
    </AdminPage>
  );
}
