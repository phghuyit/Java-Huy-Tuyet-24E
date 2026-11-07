import { apiClient } from "./axiosClient.js";

export const authService = {
  login: async (credentials) => {
    const res = await apiClient.post("/api/auth/login", credentials);
    return res.data;
  },

  clientLogin: async (credentials) => {
    const res = await apiClient.post("/api/auth/client/login", credentials);
    return res.data;
  },

  clientRegister: async (data) => {
    const res = await apiClient.post("/api/auth/client/register", data);
    return res.data;
  },

  forgotPassword: async ({ email, scope = "customer" }) => {
    const res = await apiClient.post("/api/auth/forgot-password", { email, scope });
    return res.data;
  },

  verifyResetToken: async ({ token, scope = "customer" }) => {
    const res = await apiClient.get("/api/auth/reset-password/verify", {
      params: { token, scope },
    });
    return res.data;
  },

  resetPassword: async ({ token, email, password }) => {
    const res = await apiClient.post("/api/auth/reset-password", {
      token,
      email,
      password,
    });
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post("/api/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res = await apiClient.get("/api/auth/me");
    return res.data;
  },
};

export const {
  login: loginApi,
  clientLogin: clientLoginApi,
  clientRegister: clientRegisterApi,
  forgotPassword: forgotPasswordApi,
  verifyResetToken: verifyResetTokenApi,
  resetPassword: resetPasswordApi,
  logout: logoutApi,
  getMe: getMeApi,
} = authService;
