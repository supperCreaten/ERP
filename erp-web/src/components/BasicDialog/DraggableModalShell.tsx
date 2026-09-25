import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

const DRAG_HANDLE_SELECTOR = ".app-dialog-modal__header, .ant-modal-header";

type DragOrigin = {
  x: number;
  y: number;
  ox: number;
  oy: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

type DraggableModalShellProps = {
  enabled: boolean;
  open?: boolean;
  children: ReactNode;
};

/** 拖动时弹框与视口边缘至少保留的间距 */
const VIEWPORT_EDGE = 15;

/** 弹框大于可视区域时允许贴边滑动，但不能进入 15px 边距 */
function clampOffset(origin: DragOrigin, next: { x: number; y: number }) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const boundsWidth = viewportWidth - VIEWPORT_EDGE * 2;
  const boundsHeight = viewportHeight - VIEWPORT_EDGE * 2;
  const left = origin.left + (next.x - origin.ox);
  const top = origin.top + (next.y - origin.oy);
  const minLeft = VIEWPORT_EDGE + Math.min(0, boundsWidth - origin.width);
  const maxLeft = VIEWPORT_EDGE + Math.max(0, boundsWidth - origin.width);
  const minTop = VIEWPORT_EDGE + Math.min(0, boundsHeight - origin.height);
  const maxTop = VIEWPORT_EDGE + Math.max(0, boundsHeight - origin.height);
  const clampedLeft = Math.min(Math.max(left, minLeft), maxLeft);
  const clampedTop = Math.min(Math.max(top, minTop), maxTop);
  return {
    x: next.x + (clampedLeft - left),
    y: next.y + (clampedTop - top),
  };
}

/** 通过标题栏拖动 Modal；关闭后重置位置 */
export default function DraggableModalShell({ enabled, open, children }: DraggableModalShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startRef = useRef<DragOrigin>({ x: 0, y: 0, ox: 0, oy: 0, left: 0, top: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!open) {
      setOffset({ x: 0, y: 0 });
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!enabled || !open) return;

    const root = shellRef.current;
    if (!root) return;

    const header = root.querySelector(DRAG_HANDLE_SELECTOR);
    if (!header) return;

    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest(".ant-modal-close")) return;
      if (event.button !== 0) return;

      const panel = (root.querySelector(".ant-modal-content") as HTMLElement | null) ?? root;
      const rect = panel.getBoundingClientRect();
      draggingRef.current = true;
      pointerIdRef.current = event.pointerId;
      startRef.current = {
        x: event.clientX,
        y: event.clientY,
        ox: offsetRef.current.x,
        oy: offsetRef.current.y,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!draggingRef.current || event.pointerId !== pointerIdRef.current) return;
      const origin = startRef.current;
      setOffset(
        clampOffset(origin, {
          x: origin.ox + event.clientX - origin.x,
          y: origin.oy + event.clientY - origin.y,
        }),
      );
    };

    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerIdRef.current) return;
      draggingRef.current = false;
      pointerIdRef.current = null;
    };

    header.addEventListener("pointerdown", onPointerDown as EventListener);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      header.removeEventListener("pointerdown", onPointerDown as EventListener);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [enabled, open]);

  if (!enabled) {
    return children as ReactElement;
  }

  return (
    <div
      ref={shellRef}
      className="app-dialog-draggable-shell"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}
