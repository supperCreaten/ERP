import type { AnyObject } from "antd/es/_util/type";
import type { BasicTableResponseData } from "./types";

/** 兼容 records/total 分页结构与直接数组两种后端返回 */
export function parseTableResponse(payload?: BasicTableResponseData | null) {
  if (Array.isArray(payload)) {
    return { records: payload as AnyObject[], total: payload.length };
  }
  const records = Array.isArray(payload?.records) ? (payload.records as AnyObject[]) : [];
  const total = typeof payload?.total === "number" ? payload.total : records.length;
  return { records, total };
}
