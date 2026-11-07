import { apiClient } from "./axiosClient.js";

export const reviewService = {
  getAll: async (params = {}) => {
    const res = await apiClient.get("/api/reviews", { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/api/reviews/${id}`);
    return res.data;
  },

  getByAppointmentId: async (appointmentId) => {
    const res = await apiClient.get(`/api/reviews/appointment/${appointmentId}`);
    return res.data;
  },

  getAverageRatingByStaff: async (staffId) => {
    const res = await apiClient.get(`/api/reviews/staff/${staffId}/average`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/api/reviews", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/api/reviews/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/api/reviews/${id}`);
    return res.data;
  },
};

export const {
  getAll: getReviewsApi,
  getById: getReviewByIdApi,
  getByAppointmentId: getReviewByAppointmentIdApi,
  getAverageRatingByStaff: getAverageRatingByStaffApi,
  create: createReviewApi,
  update: updateReviewApi,
  delete: deleteReviewApi,
} = reviewService;
