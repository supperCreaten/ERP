import { AppRouteRecordRaw, MenuItemType } from "@/interface";
import { normalizeKeepAlive } from "@/router/utils/flat-route-list";
import { flattenLayoutRouteChildren } from "@/router/utils/flatten-layout-routes";
import { ComponentType, lazy } from "react";
import CreateComponent from "@/components/CreateComponent";

const ExceptionUnknownComponent = lazy(() => import("@/pages/notFound/index.tsx"));
/**
 * @zh 异步获取页面组件
 * @en Async load page components
 */
const pageModules = import.meta.glob(["/src/pages/**/*.tsx"]);

const prefetchingPaths = new Set<string>();

/**
 * @zh 根据路由获取组件路径
 * @en Get component path based on route
 */
export function getComponentPathByRoute(route: AppRouteRecordRaw & { component?: string }) {
  if (route.component) return `/src/pages${route.component}.tsx`;
  return `/src/pages${route.path}/index.tsx`;
}

/**
 * 预取页面模块（菜单悬停/展开时调用），点击时直接命中缓存，减少白屏等待。
 */
export function prefetchPageByPath(path?: string | null) {
  if (!path || /https?:/.test(path)) return;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const candidates = [
    `/src/pages${normalized}/index.tsx`,
    `/src/pages${normalized}.tsx`,
  ];
  for (const componentPath of candidates) {
    if (prefetchingPaths.has(componentPath)) return;
    const loader = pageModules[componentPath] as (() => Promise<unknown>) | undefined;
    if (!loader) continue;
    prefetchingPaths.add(componentPath);
    void loader().catch(() => {
      prefetchingPaths.delete(componentPath);
    });
    return;
  }
}
/**
 * @zh 动态加载并设置路由组件
 * @en Dynamically load and set route components
 * @param route 路由配置对象
 * @param componentPath 组件文件路径
 */
const loadRouteComponent = (pageModulePaths: string[], route: AppRouteRecordRaw, componentPath: string) => {
  const moduleIndex = pageModulePaths.findIndex((path) => path === componentPath);
  if (moduleIndex !== -1) {
    // 修复：添加类型断言，将 unknown 转换为具体的组件模块类型
    const lazyComponent = pageModules[pageModulePaths[moduleIndex]] as () => Promise<{ default: ComponentType<any> }>;
    route.element = CreateComponent(lazy(lazyComponent));
  } else {
    route.element = CreateComponent(ExceptionUnknownComponent);
  }
};

/**
 * @zh 根据后端路由配置生成前端路由
 * @en Generate frontend routes based on backend route configurations
 */
export function generateRoutesFromBackend(backendRoutes: Array<MenuItemType>) {
  const pageModulePaths = Object.keys(pageModules);
  if (!backendRoutes?.length) return [];

  /**
   * 转换路由配置
   * @param menuItem 菜单配置
   * @returns 转换后的路由配置
   */
  const transformRoute = (menuItem: MenuItemType & { index?: boolean }, parentComponentPath?: string, parentMenuKey?: string): AppRouteRecordRaw => {
    const { path, meta, children, index: indexFlag, component, hidden } = menuItem;
    const isIndexRoute = indexFlag === true;
    const baseTransformedRoute = {
      handle: {
        ...meta,
        ...(meta?.keepAlive !== undefined ? { keepAlive: normalizeKeepAlive(meta.keepAlive) } : {}),
      },
      component,
      children: undefined,
      element: undefined,
    };
    const transformedRoute: AppRouteRecordRaw = isIndexRoute
      ? {
          index: true,
          ...baseTransformedRoute,
        }
      : {
          path,
          ...baseTransformedRoute,
        };

    if (isIndexRoute && parentComponentPath) {
      loadRouteComponent(pageModulePaths, transformedRoute, parentComponentPath);
    } else if (children?.length) {
      if (parentComponentPath) {
        const indexRoute: AppRouteRecordRaw = {
          index: true,
          ...baseTransformedRoute,
        };
        loadRouteComponent(pageModulePaths, indexRoute, getComponentPathByRoute(indexRoute));
        transformedRoute.children = [indexRoute, ...children.map((child) => transformRoute(child, getComponentPathByRoute(transformedRoute)))];
      } else {
        /** Layout 由 baseRoutes 根路由统一挂载，此处只生成菜单子树，最终再展平为叶子路由 */
        transformedRoute.children = children?.map((child) => transformRoute(child, getComponentPathByRoute(transformedRoute)));
      }
    } else {
      loadRouteComponent(pageModulePaths, transformedRoute, getComponentPathByRoute(transformedRoute));
    }
    return transformedRoute;
  };
  /**
   * 标准化路由配置，确保每个路由都有子路由
   */
  const normalizeRouteStructure = (menu: MenuItemType): MenuItemType => {
    if (!menu.children?.length) {
      const indexChild: MenuItemType & { index: true } = {
        key: `${menu.key}.__index`,
        label: menu.meta.title,
        path: menu.path,
        component: menu.component,
        level: menu.level,
        hidden: menu.hidden,
        meta: { ...menu.meta },
        children: undefined,
        index: true,
      };
      return {
        ...menu,
        children: [indexChild],
      };
    }
    return menu;
  };
  // 处理路由配置
  const normalizedRoutes = backendRoutes.map(normalizeRouteStructure);
  const transformedRoutes = normalizedRoutes.map((route) => transformRoute(route));
  return flattenLayoutRouteChildren(transformedRoutes);
}
