import { requestApi } from "./axiosClient.js";

export const waitlistService = {
  getAll: async (params = {}) => {
    let url = "/api/waitlist";
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.date) query.set("date", params.date);
    if (params.customerId) query.set("customerId", params.customerId);
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;
    return requestApi(url);
  },

  getById: async (id) => {
    return requestApi(`/api/waitlist/${id}`);
  },

  create: async (data) => {
    return requestApi("/api/waitlist", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return requestApi(`/api/waitlist/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return requestApi(`/api/waitlist/${id}`, {
      method: "DELETE",
    });
  },
};
