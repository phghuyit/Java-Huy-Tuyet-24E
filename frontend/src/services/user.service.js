import { apiClient } from "./axiosClient.js";

export const userService = {
  getAll: async () => {
    const res = await apiClient.get("/users");
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post("/users", data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/users/${id}`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data;
  },

  getMyProfile: async () => {
    const res = await apiClient.get("/api/profile");
    return res.data;
  },

  updateMyProfile: async (data) => {
    const res = await apiClient.put("/api/profile", data);
    return res.data;
  },

  changeMyPassword: async (data) => {
    const res = await apiClient.put("/api/profile/password", data);
    return res.data;
  },
};

export const {
  getAll: getUsersApi,
  getById: getUserByIdApi,
  create: createUserApi,
  update: updateUserApi,
  delete: deleteUserApi,
  getMyProfile: getMyProfileApi,
  updateMyProfile: updateMyProfileApi,
  changeMyPassword: changeMyPasswordApi,
} = userService;
