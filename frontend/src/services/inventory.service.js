import { requestApi } from "./axiosClient.js";

export const inventoryService = {
  getTransactions: async (productId) => {
    const url = productId ? `/api/stocks?productId=${productId}` : "/api/stocks";
    const res = await requestApi(url);
    return Array.isArray(res) ? res : [];
  },

  recordTransaction: async ({
    productId,
    type = "ADJUST",
    beforeQty,
    afterQty,
    delta,
    note = "",
    operator = "Quản trị viên",
  }) => {
    const rawType = (type || "ADJUST").toUpperCase();
    const mappedType =
      rawType === "IMPORT" ? "IN" : rawType === "EXPORT" ? "OUT" : rawType;
    const calculatedDelta =
      Number(delta) || (Number(afterQty) || 0) - (Number(beforeQty) || 0);
    const payload = {
      productId: Number(productId),
      type: mappedType,
      delta: calculatedDelta,
      note:
        note.trim() ||
        (mappedType === "IN"
          ? "Nhập kho"
          : mappedType === "OUT"
            ? "Xuất kho"
            : "Điều chỉnh kho"),
      operator: operator || "Quản trị viên",
    };

    return await requestApi("/api/stocks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
