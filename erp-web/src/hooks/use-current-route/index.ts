import { useMemo } from "react";
import { matchRoutes, useLocation } from "react-router-dom";
import { useAppRoutes } from "@/hooks/use-app-routes";
import { AppRouteRecordRaw } from "@/interface";

/**
 * 获取当前路由信息
 *
 * @returns 当前路由的匹配结果
 */
export function useCurrentRoute() {
  const routes = useAppRoutes();
  const location = useLocation();

  const currentRoute = useMemo(() => {
    const matches = matchRoutes(routes, location);
    const match = matches?.[matches.length - 1];
    return match;
  }, [routes, location]);
  return currentRoute ?? {route: {} as AppRouteRecordRaw};
}
