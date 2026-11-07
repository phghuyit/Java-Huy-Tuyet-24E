import { requestApi } from "./axiosClient.js";

export const lookbookService = {
  getAll: async (params = {}) => {
    let url = "/api/lookbook";
    const query = new URLSearchParams();
    if (params.category && params.category !== "all") query.set("category", params.category);
    if (params.staffId) query.set("staffId", params.staffId);
    if (params.serviceId) query.set("serviceId", params.serviceId);
    const queryString = query.toString();
    if (queryString) url += `?${queryString}`;
    return requestApi(url);
  },

  create: async (data) => {
    return requestApi("/api/lookbook", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
