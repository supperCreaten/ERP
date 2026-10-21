import api from "@/api";
import { useCurrentRoute } from "@/hooks/use-current-route";
import { unwrapArray } from "@/utils/apiResponse";
import LoadingScreen from "@/plugins/LoadingScreen";
import { setMenuList } from "@/store/modules/menu";
import { setUserInfo } from "@/store/modules/user";
import { getAccessToken } from "@/utils/auth";
import type { MenuInfo } from "@/interface";
import { generateMenuItemsFromMenuTree } from "@/utils/menu";
import type { RootState } from "@/store";
import { logout, showMessage, useAppDispatch } from "@/utils/methods";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const whiteList = ["/login"];

interface AuthGuardProps {
  children: React.ReactNode;
}
/**
 * @zh AuthGuard 组件，用于权限验证，代码的顺序很重要，不要随意调整
 * @en AuthGuard component, used for permission verification. The order of the code is important and should not be arbitrarily adjusted
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { pathname } = useLocation();
  const isLogin = !!getAccessToken();
  const dispatch = useAppDispatch();
  const { route } = useCurrentRoute();
  const isAuthorized = useSelector((state: RootState) => Object.keys(state.user.userInfo ?? {}).length > 0);
  const isAccessChecked = useSelector((state: RootState) => !!state.menu.isAccessChecked);
  useEffect(() => {
    async function fetchUserInfoAndRoutes() {
      let userInfoRes: Awaited<ReturnType<typeof api.getUserInfo>> | undefined;
      try {
        userInfoRes = await api.getUserInfo();
      } catch {
        userInfoRes = undefined;
      }
      /**
       * @zh 用户信息为空或请求失败时不请求菜单接口
       * @en Do not request the menu API when user info is empty or the request fails
       */
      if (!userInfoRes || !Object.keys(userInfoRes).length) {
        if (userInfoRes && !Object.keys(userInfoRes).length) {
          showMessage("未获取到用户信息,请联系管理员", "warning");
        }
        await logout();
        return;
      }
      dispatch(setUserInfo(userInfoRes));
      /** 与菜单请求并行预取 Layout，鉴权结束即可直接渲染壳层 */
      const layoutPrefetch = import("@/layout");
      let menuRes: Awaited<ReturnType<typeof api.getAuthMenus>> | undefined;
      try {
        menuRes = await api.getAuthMenus();
      } catch {
        menuRes = undefined;
      }
      await layoutPrefetch.catch(() => undefined);
      const data = unwrapArray<MenuInfo>(menuRes);
      const menuList = generateMenuItemsFromMenuTree(data);
      dispatch(setMenuList(menuList ?? []));
      if (!data?.length) {
        showMessage("未获取到菜单数据,请联系管理员", "warning");
      }
    }
    if (isLogin && !whiteList.includes(pathname) && !isAuthorized) {
      fetchUserInfoAndRoutes();
    }
  }, [pathname, isLogin, isAuthorized, dispatch, route]);
  // 白名单且无 token，允许访问（如登录页）
  if (whiteList.includes(pathname) && !isLogin) {
    return children;
  }
  /**
   * @zh 未登录条件下的处理逻辑
   * @en Processing logic under unlogged conditions
   */
  /* --------------- Start ------------------ */
  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }
  /* --------------- End ------------------ */
  /**
   * @zh 已登录条件下，匹配 login 路由，跳转到首页
   * 放到用户信息前，因为 login 路由不会请求用户信息，所以放在前面判断
   *
   * @en Under logged conditions, match the login route and jump to the home page
   * Put it before user information, because the login route will not request user information, so put it in front to judge
   */
  if (pathname === "/login") {
    return <Navigate to={import.meta.env.VITE_BASE_HOME_PATH} replace />;
  }
  /**
   * @zh 等待获取用户信息
   * @en  Waiting for user information to be obtained
   */
  if (!isAuthorized) {
    return <LoadingScreen />;
  }
  /**
   * @zh 等待获取路由信息
   * @en Waiting for route information to be obtained
   */
  if (!isAccessChecked) {
    return <LoadingScreen />;
  }
  /**
   * @zh 如果是根路由则跳转到首页（获取完用户信息之后跳转到默认首页，防止请求两次用户信息接口）
   * @en If it is the root route, jump to the home page (jump to the default home page after obtaining user information to prevent requesting twice for user information interface)
   * @zh pathname 返回的是相对 import.meta.env.BASE_URL 的路径，所以这里是相对于 BASE_URL 的根路由 "/"
   * @en pathname returns the path relative to import.meta.env.BASE_URL, so here is the root route "/" relative to BASE_URL
   */
  if (pathname === "/") {
    return <Navigate to={import.meta.env.VITE_BASE_HOME_PATH} replace />;
  }

  return children;
}
