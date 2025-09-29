import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { BASE_URL } from "./apiConfig";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Utility: ensure response takes at least `minMs` milliseconds
const ensureMinDelay = async <T>(
  promise: Promise<T>,
  minMs = 500
): Promise<T> => {
  const start = Date.now();
  const res = await promise;
  const elapsed = Date.now() - start;
  if (elapsed < minMs) await new Promise((r) => setTimeout(r, minMs - elapsed));
  return res;
};

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    ensureMinDelay(axiosInstance.get<T>(url, config)),
  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    ensureMinDelay(axiosInstance.post<T>(url, data, config)),
  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    ensureMinDelay(axiosInstance.put<T>(url, data, config)),
  patch: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    ensureMinDelay(axiosInstance.patch<T>(url, data, config)),
  delete: <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    ensureMinDelay(axiosInstance.delete<T>(url, config)),
  upload: <T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> =>
    ensureMinDelay(
      // Do NOT set Content-Type here; let browser/axios set multipart boundary automatically
      axiosInstance.post<T>(url, formData, {
        ...config,
        headers: {
          ...(config?.headers || {}),
        },
      })
    ),
  download: (
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Blob>> =>
    ensureMinDelay(
      axiosInstance.get(url, {
        ...config,
        responseType: "blob",
      })
    ),
};

export default axiosInstance;
