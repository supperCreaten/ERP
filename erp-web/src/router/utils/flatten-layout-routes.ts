import type { RouteObject } from "react-router-dom";

const stripLeadingSlash = (path: string) => path.replace(/^\//, "");

const joinPath = (prefix: string, segment: string): string => {
  if (segment === "*") return "*";
  if (!prefix) return stripLeadingSlash(segment);
  return stripLeadingSlash(`${prefix}/${segment}`.replace(/\/+/g, "/"));
};

const flattenLeaves = (items: RouteObject[], prefix = ""): RouteObject[] =>
  items.flatMap((item) => {
    const fullPath = joinPath(prefix, item.path ?? "");
    if (item.children?.length) return flattenLeaves(item.children, fullPath);

    const { children: _, ...rest } = item;
    if (item.index) {
      return [prefix ? { ...rest, path: stripLeadingSlash(prefix) } : { ...rest, index: true }];
    }
    return fullPath ? [{ ...rest, path: fullPath }] : [];
  });

/**
 * 将菜单嵌套路由树展平为叶子路由（如 system/user、system/dept）。
 * 供 generateRoutesFromBackend 使用，确保所有页面挂在根 Layout 下，避免跨顶级菜单时 Layout 重挂载。
 */
export function flattenLayoutRouteChildren(routes: RouteObject[]): RouteObject[] {
  return routes.flatMap((route) => {
    const items = route.children?.length ? route.children : [route];
    const prefix = route.children?.length ? stripLeadingSlash(route.path ?? "") : "";
    return flattenLeaves(items, prefix);
  });
}
