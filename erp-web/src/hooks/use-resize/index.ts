import type { TableScrollLayout } from "@/components/TableSection/context";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  CARD_SCROLL_EXIT_MIN_BODY_Y,
  MIN_TABLE_BODY_SCROLL_Y,
  TABLE_LAYOUT_HEIGHT_EPS,
  TABLE_RESIZE_HEIGHT_EPS,
} from "@/hooks/use-resize/constants";
import { getElementVisibleRect } from "@/utils/dom";

export const TABLE_SCROLL_AREA = "[data-basic-table-scroll-area]";
export const TABLE_TOOLBAR = "[data-basic-table-toolbar]";

export type UseAutoResizeOptions = {
  /** 默认 true：挂载与尺寸变化时自动计算；false 时仅通过 recalculate() 手动触发 */
  auto?: boolean;
  /**
   * container：按表格滚动区实际高度计算 scroll.y（表格页）
   * viewport：按视口剩余高度计算（SearchBox 展开区等）
   */
  strategy?: "container" | "viewport";
  /** 与 TableSection 同步布局（模式切换时 flushSync，避免 Card 与表体滚动不同步） */
  onLayout?: (layout: TableScrollLayout) => void;
};

type TableBodyMeasure = {
  bodyHeight: number;
  scrollAreaHeight: number;
};

function getToolbarSpace(root: HTMLElement): number {
  const toolbar = root.querySelector(TABLE_TOOLBAR) as HTMLElement | null;
  return (toolbar?.offsetHeight ?? 0) + (toolbar ? 8 : 0);
}

/** Card 内 flex 分配给表格滚动区的可用高度 */
function getCardConstrainedScrollAreaHeight(root: HTMLElement): number {
  const toolbarSpace = getToolbarSpace(root);

  const cardBody = root.closest(".ant-card-body") as HTMLElement | null;
  if (cardBody?.clientHeight) {
    const style = getComputedStyle(cardBody);
    const paddingY =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    return Math.max(0, Math.floor(cardBody.clientHeight - paddingY - toolbarSpace));
  }

  if (root.clientHeight > 0) {
    return Math.max(0, Math.floor(root.clientHeight - toolbarSpace));
  }

  return 0;
}

const ESTIMATED_TABLE_HEADER_H = 55;
const ESTIMATED_TABLE_PAGINATION_H = 64;

function getOuterHeight(el: HTMLElement): number {
  const style = getComputedStyle(el);
  const marginY = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
  return Math.ceil(el.offsetHeight + marginY);
}

/** TableSection 可视区域底边到表格滚动区顶边的可用高度 */
function getScrollAreaHeightFromTableSection(root: HTMLElement): number {
  const tableSection = root.closest(".table-section-card")?.parentElement as HTMLElement | null;
  if (!tableSection) return 0;

  const sectionRect = getElementVisibleRect(tableSection);
  const toolbarSpace = getToolbarSpace(root);
  const rootTop = getElementVisibleRect(root)?.top ?? sectionRect.top;
  const anchorTop = rootTop + toolbarSpace;

  return Math.max(0, Math.floor(sectionRect.bottom - anchorTop));
}

/** 按 Card 在视口中的底边与表格锚点顶边计算可用高度（flex 未撑开滚动区时仍准确） */
function getScrollAreaHeightFromVisibleLayout(root: HTMLElement): number {
  const toolbarSpace = getToolbarSpace(root);
  const scrollArea = root.querySelector(TABLE_SCROLL_AREA) as HTMLElement | null;
  const anchor = scrollArea ?? root;

  const cardBody = root.closest(".ant-card-body") as HTMLElement | null;
  if (cardBody) {
    const cardRect = getElementVisibleRect(cardBody);
    const anchorTop = getElementVisibleRect(anchor)?.top ?? getElementVisibleRect(root)?.top ?? 0;
    return Math.max(0, Math.floor(cardRect.bottom - anchorTop));
  }

  const top = getElementVisibleRect(anchor)?.top ?? 0;
  return Math.max(0, Math.floor(window.innerHeight - top - toolbarSpace - 16));
}

function resolveScrollAreaHeight(root: HTMLElement): number {
  const constrained = getCardConstrainedScrollAreaHeight(root);
  const fromSection = getScrollAreaHeightFromTableSection(root);
  const fromLayout = getScrollAreaHeightFromVisibleLayout(root);

  const layoutHeight = Math.max(fromSection, fromLayout, constrained);
  if (layoutHeight > 0) return layoutHeight;

  const scrollArea = root.querySelector(TABLE_SCROLL_AREA) as HTMLElement | null;
  return (scrollArea ?? root).clientHeight;
}

function queryTableHeader(scrollArea: HTMLElement): HTMLElement | null {
  return scrollArea.querySelector(
    ".ant-table-header, .ant-table-thead, thead.ant-table-thead",
  ) as HTMLElement | null;
}

function queryTablePagination(scrollArea: HTMLElement): HTMLElement | null {
  return scrollArea.querySelector(
    ".ant-table-wrapper .ant-table-pagination.ant-pagination, .ant-table-wrapper .ant-table-pagination",
  ) as HTMLElement | null;
}

function measureTableChromeHeights(
  scrollArea: HTMLElement,
  reservePagination: boolean,
): { headerH: number; paginationH: number } {
  const wrapper = scrollArea.querySelector(".ant-table-wrapper") as HTMLElement | null;

  let headerH = ESTIMATED_TABLE_HEADER_H;
  let paginationH = 0;

  const header = queryTableHeader(scrollArea);
  const pagination = queryTablePagination(scrollArea);

  if (header) headerH = getOuterHeight(header);
  else if (wrapper) {
    const thead = wrapper.querySelector("thead") as HTMLElement | null;
    if (thead) headerH = getOuterHeight(thead);
  }

  if (pagination) {
    paginationH = getOuterHeight(pagination);
  } else if (reservePagination) {
    paginationH = ESTIMATED_TABLE_PAGINATION_H;
  }

  return { headerH, paginationH };
}

/** 分页已渲染时：表头底到分页顶的间距即为表体可用高度（含 margin，避免估算偏差） */
function measureBodyHeightByPaginationGap(scrollArea: HTMLElement): number | null {
  const header = queryTableHeader(scrollArea);
  const pagination = queryTablePagination(scrollArea);
  if (!header || !pagination) return null;

  const gap = pagination.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
  if (gap <= 0) return null;

  return Math.floor(gap);
}

function measureTableBodyHeight(
  root: HTMLElement,
  reservePagination: boolean,
  inCardScrollMode: boolean,
): TableBodyMeasure {
  const scrollArea = root.querySelector(TABLE_SCROLL_AREA) as HTMLElement | null;
  const scrollAreaHeight = resolveScrollAreaHeight(root);
  if (!scrollArea || scrollAreaHeight <= 0) return { bodyHeight: 0, scrollAreaHeight: 0 };

  const areaHeight = scrollAreaHeight;

  const { headerH, paginationH } = measureTableChromeHeights(scrollArea, reservePagination);
  const subtractBody = Math.max(0, Math.floor(areaHeight - headerH - paginationH));

  /** Card 外层滚动时表体已撑开，gap 测量会偏大导致误判切回表体滚动 */
  const gapBodyHeight = inCardScrollMode ? null : measureBodyHeightByPaginationGap(scrollArea);
  const bodyHeight =
    gapBodyHeight !== null && gapBodyHeight >= subtractBody - 12
      ? gapBodyHeight
      : subtractBody;

  return { bodyHeight, scrollAreaHeight };
}

function measureViewportHeight(root: HTMLElement, reservePagination: boolean): number {
  const top = getElementVisibleRect(root)?.top ?? 0;
  const offset = 55 + (reservePagination ? 64 : 0);
  return Math.max(0, Math.floor(window.innerHeight - top - offset));
}

export default function useAutoResize(
  isShowPage: boolean = true,
  options: UseAutoResizeOptions = {},
) {
  const { auto = true, strategy = "container", onLayout } = options;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const needsCardScrollRef = useRef(false);
  const layoutSectionHeightRef = useRef(0);
  const lastHeightsRef = useRef({ maxHeight: 0, scrollAreaHeight: 0 });
  const onLayoutRef = useRef(onLayout);
  onLayoutRef.current = onLayout;
  const isSettlingModeRef = useRef(false);
  const measureRef = useRef<() => void>(() => {});
  const [maxHeight, setMaxHeight] = useState(0);
  const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
  const [needsCardScroll, setNeedsCardScroll] = useState(false);

  const commitLayout = useCallback(
    (
      next: TableScrollLayout,
      patch: { maxHeight?: number; scrollAreaHeight?: number; needsCardScroll?: boolean },
      modeChanged: boolean,
    ) => {
      const apply = () => {
        if (patch.needsCardScroll !== undefined) {
          setNeedsCardScroll(patch.needsCardScroll);
        }
        if (patch.scrollAreaHeight !== undefined) {
          setScrollAreaHeight(patch.scrollAreaHeight);
        }
        if (patch.maxHeight !== undefined) {
          setMaxHeight(patch.maxHeight);
        }
        onLayoutRef.current?.(next);
      };
      if (modeChanged && onLayoutRef.current) {
        // 避免在 useLayoutEffect / ResizeObserver 同步阶段 flushSync 触发 React 警告
        queueMicrotask(() => flushSync(apply));
      } else {
        apply();
      }
    },
    [],
  );

  const getContainerMaxHeight = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;

    if (strategy === "viewport") {
      const height = measureViewportHeight(root, isShowPage);
      needsCardScrollRef.current = false;
      const next: TableScrollLayout = {
        needsCardScroll: false,
        maxHeight: height,
        scrollAreaHeight: 0,
      };
      lastHeightsRef.current = { maxHeight: height, scrollAreaHeight: 0 };
      commitLayout(next, {
        needsCardScroll: false,
        scrollAreaHeight: 0,
        maxHeight: height,
      }, false);
      return;
    }

    const inCardScrollMode = needsCardScrollRef.current;
    const { bodyHeight, scrollAreaHeight: areaHeight } = measureTableBodyHeight(
      root,
      isShowPage,
      inCardScrollMode,
    );
    const threshold = inCardScrollMode
      ? CARD_SCROLL_EXIT_MIN_BODY_Y
      : MIN_TABLE_BODY_SCROLL_Y;
    const insufficient = areaHeight > 0 && bodyHeight < threshold;
    const height = insufficient
      ? Math.max(bodyHeight, MIN_TABLE_BODY_SCROLL_Y)
      : bodyHeight;

    const modeChanged = needsCardScrollRef.current !== insufficient;
    needsCardScrollRef.current = insufficient;

    const last = lastHeightsRef.current;
    const areaChanged =
      modeChanged || Math.abs(last.scrollAreaHeight - areaHeight) >= TABLE_RESIZE_HEIGHT_EPS;
    const heightChanged =
      modeChanged || Math.abs(last.maxHeight - height) >= TABLE_RESIZE_HEIGHT_EPS;

    const nextLayout: TableScrollLayout = {
      needsCardScroll: insufficient,
      maxHeight: heightChanged ? height : last.maxHeight,
      scrollAreaHeight: areaChanged ? areaHeight : last.scrollAreaHeight,
    };

    if (!modeChanged && !areaChanged && !heightChanged) {
      return;
    }

    if (areaChanged) {
      last.scrollAreaHeight = areaHeight;
    }
    if (heightChanged) {
      last.maxHeight = height;
    }

    commitLayout(
      nextLayout,
      {
        needsCardScroll: insufficient,
        ...(areaChanged ? { scrollAreaHeight: areaHeight } : {}),
        ...(heightChanged ? { maxHeight: height } : {}),
      },
      modeChanged,
    );

    if (modeChanged && !isSettlingModeRef.current) {
      isSettlingModeRef.current = true;
      requestAnimationFrame(() => {
        measureRef.current();
        requestAnimationFrame(() => {
          measureRef.current();
          isSettlingModeRef.current = false;
        });
      });
    }
  }, [commitLayout, isShowPage, strategy]);

  measureRef.current = getContainerMaxHeight;

  const recalculate = useCallback(() => {
    getContainerMaxHeight();
  }, [getContainerMaxHeight]);

  useLayoutEffect(() => {
    if (!auto) return;

    const root = containerRef.current;
    if (!root) return;

    let rafId: number | null = null;
    const scheduleCalc = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        getContainerMaxHeight();
      });
    };

    getContainerMaxHeight();

    /**
     * 仅监听 TableSection 块级高度（窗口/搜索区撑开），忽略表体滚动条导致的宽度或子节点抖动
     */
    const tableSection = root.closest(".table-section-card")?.parentElement as HTMLElement | null;
    const observeTarget = strategy === "container" ? (tableSection ?? root) : root;

    const observer = new ResizeObserver((entries) => {
      const blockHeight = Math.floor(entries[0]?.contentRect.height ?? 0);
      if (blockHeight <= 0) return;
      if (
        layoutSectionHeightRef.current > 0
        && Math.abs(blockHeight - layoutSectionHeightRef.current) < TABLE_LAYOUT_HEIGHT_EPS
      ) {
        return;
      }
      layoutSectionHeightRef.current = blockHeight;
      scheduleCalc();
    });
    layoutSectionHeightRef.current = Math.floor(observeTarget.getBoundingClientRect().height);
    observer.observe(observeTarget);

    window.addEventListener("resize", scheduleCalc);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", scheduleCalc);
    };
  }, [auto, getContainerMaxHeight, strategy]);

  return { containerRef, maxHeight, scrollAreaHeight, needsCardScroll, recalculate };
}
