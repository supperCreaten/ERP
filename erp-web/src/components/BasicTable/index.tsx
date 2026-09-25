import React, { forwardRef, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { TableSectionScrollContext } from "@/components/TableSection/context";
import { cn } from "@/utils/methods";
import { ConfigProvider, Table } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import useAutoResize from "@/hooks/use-resize";
import type { BasicTableHandle, BasicTableProps } from "./types";
import { useBasicTableData } from "./useBasicTableData";
import { BasicTableToolbarLeft, BasicTableToolbarRight, parseToolbarChildren } from "./toolbarSlots";

export type { BasicTableHandle, BasicTableProps } from "./types";
export { BasicTableToolbarLeft, BasicTableToolbarRight };
export { useBasicTable } from "./useBasicTable";

const BasicTable = forwardRef<BasicTableHandle, BasicTableProps>(function BasicTable(props, ref) {
  const {
    tableLayout = "fixed",
    columns,
    callback,
    onGetParams = () => ({}),
    isShowPage = true,
    isAutoResize = true,
    otherTableProps = {},
    children,
    reloadKey,
    onTableReady,
    rowKey,
    isRequest = true,
  } = props;

  const { toolbarLeft, toolbarRight } = useMemo(() => parseToolbarChildren(children), [children]);
  const showToolbar = Boolean(toolbarLeft || toolbarRight);

  const { onChange: otherOnChange, scroll: otherScroll, pagination: otherPagination, style: otherStyles, ...restTableProps } = otherTableProps;

  const { setLayout } = useContext(TableSectionScrollContext);
  const { containerRef, maxHeight, scrollAreaHeight, needsCardScroll, recalculate } = useAutoResize(isShowPage, {
    auto: isAutoResize,
    strategy: "container",
    onLayout: setLayout,
  });
  const { state, onPaginationChange, paginationConfig } = useBasicTableData({
    callback,
    onGetParams,
    isShowPage,
    reloadKey,
    rowKey,
    isRequest,
    onTableReady,
    ref,
  });

  const wasLoadingRef = useRef(state.loading);

  useLayoutEffect(() => {
    if (!isAutoResize) return;
    recalculate();
  }, [isAutoResize, isShowPage, recalculate]);

  /** 仅在请求结束后再测一次，避免随数据条数/滚动条出现反复改 scroll.y */
  useLayoutEffect(() => {
    if (!isAutoResize) return;
    if (wasLoadingRef.current && !state.loading) {
      recalculate();
    }
    wasLoadingRef.current = state.loading;
  }, [isAutoResize, recalculate, state.loading]);

  const mergedOnChange = useMemo(() => {
    if (!otherOnChange) return onPaginationChange;
    return ((pagination, filters, sorter, extra) => {
      onPaginationChange(pagination, filters, sorter, extra);
      otherOnChange(pagination, filters, sorter, extra);
    }) as NonNullable<typeof otherOnChange>;
  }, [onPaginationChange, otherOnChange]);

  const pagination = paginationConfig === false ? false : { ...paginationConfig, ...(otherPagination && typeof otherPagination === "object" ? otherPagination : {}) };

  const scrollY = !needsCardScroll && maxHeight > 0 ? maxHeight : undefined;

  /** Card 外层滚动时不设 scroll.y；表格局部滚动时固定 scroll.y，避免对象引用变化导致整表重绘 */
  const scroll = useMemo(
    () => ({
      x: "" as const,
      ...(scrollY !== undefined ? { y: scrollY } : {}),
      ...otherScroll,
    }),
    [scrollY, otherScroll],
  );

  const scrollAreaStyle = useMemo((): React.CSSProperties | undefined => {
    if (needsCardScroll || scrollAreaHeight <= 0) return undefined;
    return {
      height: scrollAreaHeight,
      flex: "1 1 auto",
    };
  }, [needsCardScroll, scrollAreaHeight]);

  return (
    <ConfigProvider locale={zhCN}>
      <div className={cn("flex min-h-0 flex-col", needsCardScroll ? "h-auto shrink-0" : "h-full")} data-basic-table-full ref={containerRef}>
        {showToolbar ? (
          <div data-basic-table-toolbar className="mb-2 flex shrink-0 items-center justify-between gap-4 px-6">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{toolbarLeft}</div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{toolbarRight}</div>
          </div>
        ) : null}
        <div data-basic-table-scroll-area className={cn("min-h-0", needsCardScroll ? "shrink-0 overflow-visible" : "flex-1 overflow-hidden")} style={scrollAreaStyle}>
          <Table
            key={reloadKey}
            bordered
            tableLayout={tableLayout}
            columns={columns}
            loading={state.loading}
            dataSource={state.tableData}
            rowKey={rowKey || "id"}
            scroll={scroll}
            style={otherStyles}
            pagination={pagination}
            onChange={mergedOnChange}
            {...restTableProps}
          />
        </div>
      </div>
    </ConfigProvider>
  );
});
BasicTable.displayName = "BasicTable";

type BasicTableComponent = typeof BasicTable & {
  ToolbarLeft: typeof BasicTableToolbarLeft;
  ToolbarRight: typeof BasicTableToolbarRight;
};

const BasicTableWithSlots = BasicTable as BasicTableComponent;
BasicTableWithSlots.ToolbarLeft = BasicTableToolbarLeft;
BasicTableWithSlots.ToolbarRight = BasicTableToolbarRight;

export default BasicTableWithSlots;
