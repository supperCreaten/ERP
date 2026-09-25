import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useAppDispatch } from "@/utils/methods";
import { useCurrentRoute } from "@/hooks/use-current-route";
import { addTab, setActiveKey } from "@/store/modules/tabs";
import { TABBAR_HOME_PATH } from "../constants";
import { buildTabLocationPath, extractRouteLabel } from "../utils/route-label";

/**
 * 标签页与路由双向同步
 *
 * - 路由变化（菜单、链接、浏览器前进后退）→ 更新 activeKey 并注册/更新标签
 * - 点击标签 → 立即更新 activeKey 并 navigate
 * - 关闭标签（含批量关闭）→ activeKey 变更后 navigate 到新标签
 *
 * alignedActiveKeyRef 仅在 pathname === activeKey 时更新，用于区分：
 * - location 先变（点标签 / 菜单）：ref 仍指向旧 activeKey，第二个 effect 不反向 navigate
 * - activeKey 先变（关标签）：ref !== 新 activeKey，第二个 effect 将 URL 对齐到新标签
 */
export function useTabRouteSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { route } = useCurrentRoute();
  const activeKey = useSelector((state: RootState) => state.tab.activeKey);
  const openTabs = useSelector((state: RootState) => state.tab.openTabs);

  /** 上次 pathname 与 activeKey 已对齐时的 activeKey（勿在路由 effect 中提前写入） */
  const alignedActiveKeyRef = useRef(activeKey);
  /** 用户点击标签后、URL 尚未切换完成前，避免路由 effect 用旧 pathname 覆盖 activeKey */
  const pendingTabKeyRef = useRef<string | null>(null);
  /** 供路由 effect 读取最新 activeKey，避免将其列入 deps 导致关 tab 后误 re-add */
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;

  const getTabLocationPath = useCallback(
    (key: string) => buildTabLocationPath(key, openTabs.get(key)?.historyState),
    [openTabs],
  );

  /** 路由 → 标签：pathname / search / hash 变化时同步 */
  useEffect(() => {
    const pathname = location.pathname;
    if (!pathname) return;

    if (pendingTabKeyRef.current) {
      if (pathname === pendingTabKeyRef.current) {
        pendingTabKeyRef.current = null;
      } else if (activeKeyRef.current === pendingTabKeyRef.current) {
        /* 标签已切换但 URL 尚未到位，勿用旧 pathname 覆盖 activeKey */
        return;
      } else {
        pendingTabKeyRef.current = null;
      }
    }

    dispatch(setActiveKey(pathname));

    const routeTitle = route?.handle?.title || '' as ReactNode | undefined;

    dispatch(
      addTab({
        key: pathname,
        label: extractRouteLabel(routeTitle),
        historyState: { search: location.search, hash: location.hash },
        closable: pathname !== TABBAR_HOME_PATH,
        draggable: pathname !== TABBAR_HOME_PATH,
      }),
    );
  }, [location.pathname, location.search, location.hash, route, dispatch]);

  /**
   * activeKey → 路由：关闭标签后 Redux 已指向新 tab，但 URL 仍停在已关闭页时需补齐跳转。
   */
  useEffect(() => {
    if (!activeKey) return;

    if (location.pathname === activeKey) {
      alignedActiveKeyRef.current = activeKey;
      return;
    }

    /* location 已变、activeKey 尚未跟上（点标签 / 菜单导航）—— 等待路由 effect 更新 activeKey */
    if (alignedActiveKeyRef.current === activeKey) {
      return;
    }

    navigate(getTabLocationPath(activeKey));
  }, [activeKey, location.pathname, navigate, getTabLocationPath]);

  const handleTabChange = useCallback(
    (key: string) => {
      pendingTabKeyRef.current = key;
      /* 先更新高亮，避免等路由 effect 才切换选中态 */
      dispatch(setActiveKey(key));
      navigate(getTabLocationPath(key));
    },
    [dispatch, navigate, getTabLocationPath],
  );

  return { handleTabChange, activeKey };
}
