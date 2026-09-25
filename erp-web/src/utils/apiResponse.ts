/** 接口响应体：{ code, data, msg } 或直接返回业务数据 */
export type ApiEnvelope<T = unknown> = { data?: T; code?: number; msg?: string };

/** 解包接口 data 字段；无 data 时返回 res 本身 */
export function unwrapData<T>(res?: unknown): T {
  return ((res as ApiEnvelope<T>)?.data ?? res) as T;
}

/** 解包后为空时使用 fallback */
export function unwrapDataWith<T>(res: unknown, fallback: T): T {
  const raw = unwrapData<T | null | undefined>(res);
  return raw ?? fallback;
}

/** 解包对象结构，缺省为空对象 */
export function unwrapRecord(res?: unknown): Record<string, unknown> {
  return unwrapData<Record<string, unknown>>(res) ?? {};
}

/** 解包数组结构，缺省为空数组 */
export function unwrapArray<T = unknown>(res?: unknown): T[] {
  return unwrapData<T[]>(res) ?? [];
}
