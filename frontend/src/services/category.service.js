import { apiClient } from "./axiosClient.js";

export const categoryService = {
  getAll: async (type) => {
    const params = type ? { type } : {};
    const res = await apiClient.get("/api/categories", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/categories/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/api/categories", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/categories/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/categories/${id}`);
    return res.data;
  },
};

export const {
  getAll: getCategoriesApi,
  getById: getCategoryByIdApi,
  create: createCategoryApi,
  update: updateCategoryApi,
  delete: deleteCategoryApi,
} = categoryService;
