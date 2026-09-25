import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken } from "./auth";
import { showMessage, logout, isSvgString } from "./methods";
import {
  finalizeRequestControl,
  isCanceledError,
  prepareRequestControl,
} from "./ajaxRequestControl";
import { unwrapData } from "./apiResponse";

export { cancelPendingRequestsOnRouteChange } from "./ajaxRequestControl";

const baseURL = import.meta.env.VITE_API_URL;
const REFRESH_URL = "/api/refreshToken";
const UNAUTHORIZED = 401;
const DEFAULT_ERROR_MSG = "系统错误，请稍后再试";
const FORM_DATA_MIN_TIMEOUT = 60_000;

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type QueueItem = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: RetryableConfig;
};

type ApiBody = { code?: number; data?: string; msg?: string };

/**
 * 响应拦截器已 unwrapData，请求方法直接返回业务 data，而不是 AxiosResponse
 */
export type AppRequest = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  options<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
};

const service = axios.create({
  baseURL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
});

let isRefreshing = false;
let requestQueue: QueueItem[] = [];

function isRefreshRequest(config: InternalAxiosRequestConfig) {
  return (config.url ?? "").includes(REFRESH_URL);
}

function attachAccessToken(config: InternalAxiosRequestConfig) {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
}

function getErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MSG) {
  if (!error) return fallback;
  const e = error as {
    msg?: string;
    message?: string;
    response?: { data?: { msg?: string } };
  };
  return e.response?.data?.msg || e.msg || e.message || fallback;
}

/** 走 service；refresh 401 由 isRefreshRequest 直接 logout，不再触发二次刷新 */
async function refreshAccessToken() {
  // 拦截器解包后，data 即为 accessToken 字符串
  const accessToken = await (service.get(REFRESH_URL) as Promise<unknown>).then((res) => {
    if (typeof res === "string") return res;
    return (res as ApiBody)?.data;
  });
  if (!accessToken) {
    throw new Error("刷新 access token 失败");
  }
  setAccessToken(accessToken);
}

function processQueue(error: unknown | null) {
  const queue = requestQueue;
  requestQueue = [];
  queue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
      return;
    }
    attachAccessToken(config);
    resolve(service(config));
  });
}

/** HTTP 401 或业务 code 401：刷新 token 后重试原请求 */
async function handleUnauthorized(originalRequest: RetryableConfig, reason?: unknown) {
  if (isRefreshRequest(originalRequest)) {
    void logout();
    return Promise.reject(reason ?? new Error("未认证"));
  }
  // 已刷新过重试仍 401：不再刷，提示后拒绝
  if (originalRequest._retry) {
    showMessage(getErrorMessage(reason, "登录已失效，请重新登录"));
    return Promise.reject(reason ?? new Error("未认证"));
  }

  originalRequest._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      requestQueue.push({ resolve, reject, config: originalRequest });
    });
  }

  isRefreshing = true;
  try {
    await refreshAccessToken();
    processQueue(null);
    attachAccessToken(originalRequest);
    return service(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError);
    void logout();
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
}

service.interceptors.request.use(
  async (config) => {
    await prepareRequestControl(config);
    attachAccessToken(config);
    if (config.data instanceof FormData) {
      // 交给浏览器/axios 生成带 boundary 的 multipart；勿手写 multipart/form-data
      config.headers.delete("Content-Type");
      config.timeout = Math.max(config.timeout || 0, FORM_DATA_MIN_TIMEOUT);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

service.interceptors.response.use(
  (response) => {
    const { data, config } = response;
    finalizeRequestControl(config);
    if (data instanceof Blob || isSvgString(data)) return data;

    const code = (data as ApiBody)?.code;
    // 认证失败多为 HTTP 200 + 业务 code 401（见 AuthenticationEntryPointImpl）
    if (code === UNAUTHORIZED) {
      return handleUnauthorized(config as RetryableConfig, data);
    }
    if (code !== 200) {
      showMessage(getErrorMessage(data));
      return Promise.reject(data);
    }
    return unwrapData(data);
  },
  async (error) => {
    finalizeRequestControl(error.config);
    if (isCanceledError(error)) {
      return Promise.reject(error);
    }
    const originalRequest = error.config as RetryableConfig | undefined;
    if (!originalRequest) {
      showMessage(getErrorMessage(error));
      return Promise.reject(error);
    }
    if (error.response?.status === UNAUTHORIZED) {
      return handleUnauthorized(originalRequest, error);
    }
    showMessage(getErrorMessage(error));
    return Promise.reject(error);
  },
);
export default service as unknown as AppRequest;;
