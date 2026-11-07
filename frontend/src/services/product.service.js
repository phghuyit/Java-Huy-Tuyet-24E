import { apiClient } from "./axiosClient.js";

export const productService = {
  getAll: async (categoryId) => {
    const res = await apiClient.get("/api/products", {
      params: categoryId ? { categoryId } : undefined,
    });
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/products/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/api/products", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/products/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/products/${id}`);
    return res.data;
  },

  adjustStock: async (product, delta) => {
    const newQty = Math.max(0, (product.stockQuantity || 0) + delta);
    const payload = {
      name: product.name,
      sku: product.sku,
      unit: product.unit || "Chai",
      categoryId: product.categoryId || null,
      costPrice: product.costPrice || 0,
      salePrice: product.salePrice || 0,
      stockQuantity: newQty,
      minStock: product.minStock || 5,
      isForSale: product.isForSale ?? true,
      status: product.status || "ACTIVE",
      imageUrl: product.imageUrl || null,
    };
    const res = await apiClient.put(`/api/products/${product.id}`, payload);
    return res.data;
  },

  batchAdjust: async (adjustments) => {
    return Promise.all(
      adjustments.map(({ product, delta }) =>
        productService.adjustStock(product, delta)
      )
    );
  },
};
