import { apiClient } from "./axiosClient.js";

export const staffService = {
  getAll: async () => {
    const res = await apiClient.get("/api/staff");
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/staff/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/api/staff", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/staff/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/staff/${id}`);
    return res.data;
  },
};

export const {
  getAll: getStaffApi,
  getById: getStaffByIdApi,
  create: createStaffApi,
  update: updateStaffApi,
  delete: deleteStaffApi,
} = staffService;
