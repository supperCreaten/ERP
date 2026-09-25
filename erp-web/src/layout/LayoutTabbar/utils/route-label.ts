import type { ReactElement, ReactNode } from "react";
import { isValidElement } from "react";

/** 从路由 handle.title 提取可存储的字符串标题 */
export function extractRouteLabel(routeTitle: ReactNode | undefined): string {
  if (routeTitle == null) return "";
  if (isValidElement(routeTitle)) {
    return `${(routeTitle as ReactElement<{ children?: ReactNode }>).props?.children ?? ""}`;
  }
  return typeof routeTitle === "string" ? routeTitle : `${routeTitle}`;
}

/** 拼接标签对应完整路径（pathname + search + hash） */
export function buildTabLocationPath(
  pathname: string,
  historyState?: { search?: string; hash?: string },
): string {
  const search = historyState?.search ?? "";
  const hash = historyState?.hash ?? "";
  return pathname + search + hash;
}
