import type { AnyObject } from "antd/es/_util/type";
import type { BasicTableResponseData } from "./types";

/** 兼容 records/total 分页结构与直接数组两种后端返回（total 可能为 number 或 Long 序列化后的 string） */
export function parseTableResponse(payload?: BasicTableResponseData | null) {
  if (Array.isArray(payload)) {
    return { records: payload as AnyObject[], total: payload.length };
  }
  const records = Array.isArray(payload?.records) ? (payload.records as AnyObject[]) : [];
  const rawTotal = payload?.total;
  const parsedTotal = typeof rawTotal === "number" ? rawTotal : typeof rawTotal === "string" && rawTotal !== "" ? Number(rawTotal) : NaN;
  const total = Number.isFinite(parsedTotal) ? parsedTotal : records.length;
  return { records, total };
}
