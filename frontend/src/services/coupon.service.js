import { apiClient } from "./axiosClient.js";

export const couponService = {
  getAll: async (activeOnly = false) => {
    const res = await apiClient.get(`/api/coupons?activeOnly=${activeOnly}`);
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/coupons/${id}`);
    return res.data;
  },

  getByCode: async (code) => {
    const res = await apiClient.get(`/api/coupons/code/${code}`);
    return res.data;
  },

  validate: async (code, orderAmount) => {
    const res = await apiClient.post("/api/coupons/validate", {
      code,
      orderAmount,
    });
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/api/coupons", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/coupons/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/coupons/${id}`);
    return res.data;
  },
};

export const {
  getAll: getCouponsApi,
  getById: getCouponByIdApi,
  getByCode: getCouponByCodeApi,
  validate: validateCouponApi,
  create: createCouponApi,
  update: updateCouponApi,
  delete: deleteCouponApi,
} = couponService;
