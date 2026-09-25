import {
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
} from "@/hooks/use-layout/constants";
import { useAppDispatch } from "@/utils/methods";
import { setPreferences } from "@/store/modules/preferences";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function clearBodyResizeStyle() {
  document.body.classList.remove("sidebar-resizing");
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

type UseSidebarResizeOptions = {
  /** 当前侧栏展开宽度 */
  sidebarWidth: number;
  /** 折叠时不可拖拽 */
  disabled?: boolean;
  minWidth?: number;
  maxWidth?: number;
};

/**
 * 侧边栏交界处拖拽调宽：写入 preferences.sidebarWidth，并同步 body 拖拽态样式。
 */
export function useSidebarResize({
  sidebarWidth,
  disabled = false,
  minWidth = SIDEBAR_WIDTH_MIN,
  maxWidth = SIDEBAR_WIDTH_MAX,
}: UseSidebarResizeOptions) {
  const dispatch = useAppDispatch();
  const [resizing, setResizing] = useState(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startWidth: sidebarWidth,
      };
      setResizing(true);
      document.body.classList.add("sidebar-resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [disabled, sidebarWidth],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const next = clamp(
        Math.round(drag.startWidth + (e.clientX - drag.startX)),
        minWidth,
        maxWidth,
      );
      dispatch(setPreferences({ sidebarWidth: next }));
    },
    [dispatch, minWidth, maxWidth],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setResizing(false);
    clearBodyResizeStyle();
  }, []);

  useEffect(() => clearBodyResizeStyle, []);

  return {
    resizing,
    resizeHandleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}
