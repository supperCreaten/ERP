import type { AnyObject } from "antd/es/_util/type";
import type { BasicTableResponseData } from "./types";

/** 解析后端分页结构 data.rows / data.total（total 可能为 number 或 Long 序列化后的 string） */
export function parseTableResponse(payload?: BasicTableResponseData | null) {
  if (Array.isArray(payload)) {
    return { rows: payload as AnyObject[], total: payload.length };
  }
  const rows = Array.isArray(payload?.rows) ? (payload.rows as AnyObject[]) : [];
  const rawTotal = payload?.total;
  const parsedTotal = typeof rawTotal === "number" ? rawTotal : typeof rawTotal === "string" && rawTotal !== "" ? Number(rawTotal) : NaN;
  const total = Number.isFinite(parsedTotal) ? parsedTotal : rows.length;
  return { rows, total };
}
