import axios from "axios";

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const isMultipart =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isMultipart) {
      delete config.headers["Content-Type"];
    }

    if (typeof window !== "undefined") {
      const isPathAdmin = window.location.pathname.startsWith("/admin");
      const scope = isPathAdmin ? "admin" : "customer";
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("X-Auth-Scope", scope);
      }
      if (config.headers) {
        config.headers["X-Auth-Scope"] = scope;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return { ...response, data: null };
    }
    return response;
  },
  (error) => {
    if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const data = error.response?.data;
    const url = error.config?.url || "";

    const message =
      data?.detail ||
      data?.message ||
      (status
        ? `API trả về lỗi HTTP ${status}.`
        : "Không kết nối được máy chủ. Vui lòng kiểm tra backend và thử lại.");

    const normalizedError = new Error(message);
    normalizedError.status = status;
    normalizedError.data = data;

    if (typeof window !== "undefined") {
      if (status === 403 && data?.code === "FORBIDDEN" && !url.includes("/api/auth/me")) {
        window.dispatchEvent(new Event("vela:forbidden"));
      }
      if (status === 401 && !url.includes("/api/auth/login") && !url.includes("/api/auth/client/login")) {
        window.dispatchEvent(new Event("vela:unauthorized"));
      }
    }

    return Promise.reject(normalizedError);
  }
);

export async function requestApi(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  let data = options.body;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
    }
  }

  const response = await apiClient.request({
    url: path,
    method,
    data,
    headers: options.headers,
    signal: options.signal,
  });

  return response.data;
}

export function getApiImageUrl(value) {
  if (!value) return "";
  return value.startsWith("/api/avatars/") ? `${API_URL}${value}` : value;
}
