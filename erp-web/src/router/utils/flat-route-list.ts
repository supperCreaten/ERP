import type { MenuItemType, RouteMeta } from "@/interface";

export interface FlatRouteItem {
  handle: Pick<RouteMeta, "keepAlive"> & Partial<RouteMeta>;
}

/** 非后端菜单的固定路由（路径需与浏览器 pathname 一致） */
export const STATIC_FLAT_ROUTES: Record<string, FlatRouteItem> = {
  [import.meta.env.VITE_BASE_HOME_PATH]: {
    handle: { keepAlive: true },
  },
  "/personal-center/my-profile": {
    handle: { keepAlive: true },
  },
};

/** 将菜单 meta.keepAlive（0/1 或 boolean）规范为 boolean，默认 true */
export function normalizeKeepAlive(value: unknown): boolean {
  if (value === false || value === 0 || value === "0") {
    return false;
  }
  return true;
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 将路由路径转为可匹配 pathname + search 的 exclude 规则 */
export function pathToKeepAliveExcludePattern(path: string): string | RegExp {
  if (path.includes("?") || path.includes("*")) {
    return path;
  }
  return new RegExp(`^${escapeRegExp(path)}(\\?.*)?$`);
}

/**
 * 从菜单树扁平化路由表，key 为完整路径（与 location.pathname / 标签页 key 一致）
 */
export function flattenMenuRoutes(
  menus: MenuItemType[] | undefined,
  result: Record<string, FlatRouteItem> = {},
): Record<string, FlatRouteItem> {
  if (!menus?.length) {
    return result;
  }
  for (const menu of menus) {
    if (menu?.key) {
      result[menu.key] = {
        handle: {
          ...menu.meta,
          keepAlive: normalizeKeepAlive(menu.meta?.keepAlive),
        },
      };
    }
    if (menu.children?.length) {
      flattenMenuRoutes(menu.children, result);
    }
  }
  return result;
}

export function buildFlatRouteList(wholeMenus: MenuItemType[] | undefined): Record<string, FlatRouteItem> {
  return {
    ...STATIC_FLAT_ROUTES,
    ...flattenMenuRoutes(wholeMenus),
  };
}

/**
 * 根据是否开启多标签与路由 keepAlive 配置，生成 KeepAlive 的 exclude 列表
 */
export function getKeepAliveExclude(
  flatRouteList: Record<string, FlatRouteItem>,
  tabbarEnable: boolean,
): Array<string | RegExp> {
  if (!tabbarEnable) {
    return [/.*/];
  }
  return Object.entries(flatRouteList).reduce<Array<string | RegExp>>((acc, [path, { handle }]) => {
    if (handle.keepAlive === false) {
      acc.push(pathToKeepAliveExcludePattern(path));
    }
    return acc;
  }, []);
}

/** 从 activeCacheKey（pathname + search）解析 pathname，用于与标签页 key 对齐 */
export function getPathnameFromCacheKey(cacheKey: string): string {
  const queryIndex = cacheKey.indexOf("?");
  const hashOnlyIndex = cacheKey.indexOf("#");
  const end =
    queryIndex >= 0 ? queryIndex : hashOnlyIndex >= 0 ? hashOnlyIndex : cacheKey.length;
  return cacheKey.slice(0, end) || cacheKey;
}
