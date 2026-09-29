import type { AxiosRequestConfig } from "axios";
import request from "@/utils/request";

export default {
  login: (data: any) => request.post("/api/login", data),
  getAuthMenus: () => request.get("/api/authRoutes"),
  getUserInfo: () => request.get("/api/userInfo"),
  refreshToken: () => request.get("/api/refreshToken"),
  logout: () => request.post("/api/logout"),
  changePassword: (data: Record<string, unknown>) => request.post("/api/user/changePassword", data),
  decryptSensitive: (data: { cipherText: string; secretKey: string }) => request.post("/api/decryptSensitive", data),
  uploadApi: (data: FormData, config?: AxiosRequestConfig) => request.post("/api/upload", data, config),
};
