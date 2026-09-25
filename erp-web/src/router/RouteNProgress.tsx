import type { RootState } from "@/store";
import { cancelPendingRequestsOnRouteChange } from "@/utils/request";
import { NProgress } from "@/utils/progress";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

/**
 * 已加载过的 pathname（对齐 react-antd-admin router `loadedPaths`）
 * 再次进入已访问路径不 start，避免标签/菜单切换闪条
 */
const loadedPaths = new Set<string>();

/**
 * 路由进度条（对齐 react-antd-admin）
 * - start：根路由 loader / shouldRevalidate → 仅「首次」进入某 path
 * - done：LayoutRoot 在 pathname 变化后收尾
 */
export default function RouteNProgress() {
  const { pathname, search } = useLocation();
  const transitionProgress = useSelector((state: RootState) => state.preferences.transitionProgress);
  const cancelPrevRef = useRef<string | null>(null);
  const progressPathRef = useRef<string | null>(null);

  /** 路径变化时取消在途请求（本项目能力，与进度条解耦） */
  useEffect(() => {
    const key = pathname + search;
    if (cancelPrevRef.current === null) {
      cancelPrevRef.current = key;
      return;
    }
    if (cancelPrevRef.current === key) return;
    cancelPrevRef.current = key;
    cancelPendingRequestsOnRouteChange();
  }, [pathname, search]);

  /**
   * 对齐 shouldRevalidate / loader：在绘制前 start
   * 仅 pathname 变化（或首屏）时触发，开关偏好本身不 start
   */
  useLayoutEffect(() => {
    const prev = progressPathRef.current;
    const pathChanged = prev !== null && prev !== pathname;
    const isFirst = prev === null;
    progressPathRef.current = pathname;

    if (!transitionProgress) return;
    if (!isFirst && !pathChanged) return;
    if (loadedPaths.has(pathname)) return;

    NProgress.start();
    loadedPaths.add(pathname);
  }, [pathname, transitionProgress]);

  /** 对齐 LayoutRoot：pathname 落地后 done */
  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
}
