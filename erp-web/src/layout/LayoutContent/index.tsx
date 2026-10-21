import { ELEMENT_ID_MAIN_CONTENT } from "@/layout/constants";
import { useFlatRouteList } from "@/hooks/use-flat-route-list";
import { getKeepAliveExclude, getPathnameFromCacheKey } from "@/router/utils/flat-route-list";

import { Spin, theme } from "antd";
import { KeepAlive, useKeepAliveRef } from "keepalive-for-react";
import { Suspense, useEffect, useMemo, useRef } from "react";

import { useLocation, useOutlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { BasicContent } from "@/components/BasicContent";
import { setIsRefresh } from "@/store/modules/tabs";
import { useAppDispatch } from "@/utils/methods";
import type { RootState } from "@/store";

export interface LayoutContentProps {}

/** 路由懒加载占位：仅内容区轻量 Spin，不遮挡侧栏/顶栏 */
function RoutePageFallback() {
  return (
    <div className="route-page-fallback flex h-full min-h-0 w-full items-center justify-center" aria-busy>
      <Spin size="default" />
    </div>
  );
}

export default function LayoutContent() {
  const {
    token: { colorBgLayout },
  } = theme.useToken();
  const { pathname, search } = useLocation();
  const outlet = useOutlet();
  const aliveRef = useKeepAliveRef();
  const dispatch = useAppDispatch();
  const flatRouteList = useFlatRouteList();
  const { tabbarEnable, transitionName, transitionEnable } = useSelector(
    (state: RootState) => state.preferences,
  );
  const keepaliveDuration = 300;
  const destroyTimerRef = useRef<number | null>(null);
  const keepaliveCacheClass = transitionEnable ? `keepalive-${transitionName}` : undefined;
  const isRefresh = useSelector((state: RootState) => state.tab.isRefresh);
  const openTabs = useSelector((state: RootState) => state.tab.openTabs);
  // const tabbarEnable = usePreferencesStore(state => state.tabbarEnable);
  // const transitionName = usePreferencesStore(state => state.transitionName);
  // const transitionEnable = usePreferencesStore(state => state.transitionEnable);

  /**
   * to distinguish different pages to cache
   */
  const cacheKey = useMemo(() => {
    return pathname + search;
  }, [pathname, search]);

  /**
   * 关闭标签页时销毁对应路由缓存（标签 key 为 pathname，cacheKey 可能带 search）
   */
  useEffect(() => {
    if (!tabbarEnable) {
      return;
    }
    const openPaths = new Set(Array.from(openTabs.keys()));
    const cacheNodes = aliveRef.current?.getCacheNodes?.();
    const staleKeys =
      cacheNodes
        ?.filter((node) => !openPaths.has(getPathnameFromCacheKey(node.cacheKey)))
        .map((node) => node.cacheKey) ?? [];

    if (!staleKeys.length) {
      return;
    }

    const delay = transitionEnable ? keepaliveDuration : 0;
    const timer = window.setTimeout(() => {
      staleKeys.forEach((key) => {
        void aliveRef.current?.destroy(key);
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [openTabs, tabbarEnable, aliveRef, transitionEnable, keepaliveDuration]);

  /** 关闭多 tab 时仅保留当前页缓存 */
  useEffect(() => {
    if (tabbarEnable) {
      return;
    }

    if (destroyTimerRef.current) {
      clearTimeout(destroyTimerRef.current);
    }

    const cacheNodes = aliveRef.current?.getCacheNodes?.();
    const staleKeys =
      cacheNodes?.filter((node) => node.cacheKey !== cacheKey).map((node) => node.cacheKey) ?? [];

    if (!staleKeys.length) {
      return;
    }

    const delay = transitionEnable ? keepaliveDuration : 0;
    destroyTimerRef.current = window.setTimeout(() => {
      staleKeys.forEach((key) => {
        void aliveRef.current?.destroy(key);
      });
      destroyTimerRef.current = null;
    }, delay);

    return () => {
      if (destroyTimerRef.current) {
        clearTimeout(destroyTimerRef.current);
        destroyTimerRef.current = null;
      }
    };
  }, [tabbarEnable, cacheKey, aliveRef, transitionEnable, keepaliveDuration]);

  /* 标签栏「刷新页面」：Tabbar 在 KeepAlive 外，不能用 useKeepAliveContext，只能在此用 aliveRef */
  useEffect(() => {
    if (!isRefresh) {
      return;
    }
    if (tabbarEnable) {
      aliveRef.current?.refresh(cacheKey);
    }
    dispatch(setIsRefresh(false));
  }, [isRefresh, tabbarEnable, cacheKey, dispatch, aliveRef]);

  /** 路由 handle.keepAlive === false 时不缓存；未开多标签时 exclude 全部以保留过渡动画 */
  const keepAliveExclude = useMemo(
    () => getKeepAliveExclude(flatRouteList, tabbarEnable),
    [flatRouteList, tabbarEnable],
  );

  return (
    <main
      id={ELEMENT_ID_MAIN_CONTENT}
      className="flex-1 overflow-hidden"
      style={{
        backgroundColor: colorBgLayout,
      }}
    >
        <div className="flex h-full min-h-0 flex-col">
          <KeepAlive
            max={20}
            transition={transitionEnable}
            duration={keepaliveDuration}
            containerClassName="keep-alive-render"
            cacheNodeClassName={keepaliveCacheClass}
            exclude={keepAliveExclude}
            activeCacheKey={cacheKey}
            aliveRef={aliveRef}
          >
            <BasicContent>
              <Suspense fallback={<RoutePageFallback />}>{outlet}</Suspense>
            </BasicContent>
          </KeepAlive>
        </div>
    </main>
  );
}
