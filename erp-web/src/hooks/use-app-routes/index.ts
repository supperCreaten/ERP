import { useDynamicRoutes } from "@/router/utils";
import { createElement, lazy, useMemo } from "react";
import { type RouteObject } from "react-router-dom";

/** 与登录页拆包：访问 /login 不拉取整站 Layout、个人中心、头像裁剪等大 chunk */
const Login = lazy(() => import("@/pages/login"));
const Home = lazy(() => import("@/pages/home"));
const Layout = lazy(() => import("@/layout"));
const MyProfile = lazy(() => import("@/pages/personal-center/my-profile"));
const NotFound = lazy(() => import("@/pages/notFound"));

export function useAppRoutes(): RouteObject[] {
  const dynamicRoutes = useDynamicRoutes();
  return useMemo(() => {
    const layoutChildren: RouteObject[] = [
      {
        path: "home",
        element: createElement(Home),
        handle: {
          title: "首页",
          icon: "home",
          keepAlive: true,
        },
      },
      ...dynamicRoutes,
      {
        path: "personal-center/my-profile",
        element: createElement(MyProfile),
        handle: {
          title: "个人中心",
          icon: "personal-center",
          keepAlive: true,
        },
      },
      {
        path: "*",
        element: createElement(NotFound),
        handle: {
          title: "404",
        },
      },
    ];

    const baseRoutes: RouteObject[] = [
      {
        path: "/login",
        element: createElement(Login),
        handle: {
          title: "登录",
        },
      },
      {
        path: "/",
        element: createElement(Layout),
        children: layoutChildren,
      },
    ];
    return baseRoutes;
  }, [dynamicRoutes]);
}
