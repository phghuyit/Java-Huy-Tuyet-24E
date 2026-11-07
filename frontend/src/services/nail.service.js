import { apiClient } from "./axiosClient.js";

export const nailService = {
  getAll: async () => {
    const res = await apiClient.get("/api/services");
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/services/${id}`);
    return res.data;
  },

  getBySlug: async (slug) => {
    const res = await apiClient.get(`/api/services/slug/${slug}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/api/services", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/services/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/services/${id}`);
    return res.data;
  },
};

export const {
  getAll: getServicesApi,
  getById: getServiceByIdApi,
  getBySlug: getServiceBySlugApi,
  create: createServiceApi,
  update: updateServiceApi,
  delete: deleteServiceApi,
} = nailService;
