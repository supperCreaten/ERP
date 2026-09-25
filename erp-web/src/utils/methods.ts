import store from "@/store";
import { message } from "@/utils/static-antd";
import { removeToken } from "./auth";
import crypto from "crypto-js";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/interface";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GetProp, UploadProps } from "antd";
import dayjs from "dayjs";
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
export const useAppDispatch: () => AppDispatch = useDispatch;
export const showMessage = (msg: string, type: "success" | "error" | "warning" | "info" = "error") => {
  return message[type](msg);
};
export async function logout() {
  try {
    const { default: api } = await import("@/api");
    await api.logout();
  } catch {
    // 网络异常或 token 已失效时仍清理本地登录态
  }
  store.dispatch({ type: "auth/logout" });
  removeToken();
  window.location.href = "#/login";
}
export function getParams(data = {}) {
  const params: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (key !== undefined && val != null && val !== "") {
      params[key] = val;
    }
  }
  return params;
}
export function isSvgString(data: string | unknown): boolean {
  if (typeof data != "string") return false;
  const svgRegex = /^<svg\b[^>]*>[\s\S]*<\/svg>$/i;
  return svgRegex.test(data.trim());
}
//AES加密
export function aesEncrypt(str: string) {
  if (!str) return;
  const key = crypto.enc.Utf8.parse("mm7h3ck87ugk9l4a"); // 128位密钥
  const iv = crypto.enc.Utf8.parse("jxkvxz97409u3m8c"); // 初始化向量
  const encrypted = crypto.AES.encrypt(str, key, {
    iv: iv,
    mode: crypto.mode.CBC,
    padding: crypto.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export const getBirthdayToAge = (birthday: string) => {
  const birthdayDate = birthday ?? 0;
  return dayjs().diff(birthdayDate, "year");
};
//去空格
export function getValueFromTtim(event: { target: { value: string } }) {
  return event.target.value.replace(/\s/g, "");
}