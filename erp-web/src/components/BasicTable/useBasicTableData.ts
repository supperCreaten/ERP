import { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { TablePaginationConfig, TableProps } from "antd";
import { useTableReducer } from "@/hooks/use-table";
import { getParams } from "@/utils/methods";
import { isCanceledError } from "@/utils/ajaxRequestControl";
import type { BasicTableCallback, BasicTableHandle } from "./types";
import { parseTableResponse } from "./utils";
import { GetRowKey } from "antd/es/table/interface";

type UseBasicTableDataOptions = {
  callback?: BasicTableCallback;
  onGetParams: () => Record<string, unknown>;
  isShowPage: boolean;
  reloadKey?: number | string;
  rowKey?: string | GetRowKey<any>;
  isRequest?: boolean;
  onTableReady?: (api: BasicTableHandle) => void;
  ref: React.ForwardedRef<BasicTableHandle>;
};

export function useBasicTableData({ callback, onGetParams, isShowPage, reloadKey, rowKey = "id", onTableReady, ref, isRequest = true }: UseBasicTableDataOptions) {
  const { state, dispatch } = useTableReducer();
  const stateRef = useRef(state);
  stateRef.current = state;

  const onGetParamsRef = useRef(onGetParams);
  onGetParamsRef.current = onGetParams;

  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const rowKeyField = String(rowKey)
  const skipPageEffectRef = useRef(false);
  /** 丢弃过期响应，避免连点查询时旧请求覆盖新数据 */
  const requestIdRef = useRef(0);

  const apiRef = useRef<BasicTableHandle>({
    getTableData: async () => {},
    getTableRecords: () => {},
    setTableData: () => {},
    addTableRow: () => {},
    searchRefresh: async () => {},
    patchRow: () => {},
  });

  const fetchTableData = useCallback(
    async (options?: { currentPage?: number }) => {
      if (!callbackRef.current) return;
      const requestId = ++requestIdRef.current;
      const pageSize = stateRef.current.pageSize;
      const currentPage = options?.currentPage ?? stateRef.current.currentPage;
      const data = getParams(onGetParamsRef.current());
      dispatch({ type: "INIT" });
      const pagination = isShowPage ? { pageSize, currentPage } : {};
      const params = { ...pagination, ...data };
      try {
        const payload = await callbackRef.current(params);
        if (requestId !== requestIdRef.current) return;
        const { rows, total } = parseTableResponse(payload);
        dispatch({
          type: "SET_TABLE_DATA",
          tableData: rows,
          total,
          ...(options?.currentPage !== undefined ? { currentPage: options.currentPage } : {}),
        });
      } catch (error) {
        if (isCanceledError(error)) return;
        throw error;
      } finally {
        if (requestId === requestIdRef.current) {
          dispatch({ type: "SET_LOADING" });
        }
      }
    },
    [dispatch, isShowPage],
  );
  const setTableData = (next: any[] | ((prev: any[]) => any[])) => {
    const prev = stateRef.current.tableData ?? [];
    const tableData = typeof next === "function" ? next(prev) : next;
    dispatch({
      type: "SET_TABLE_RECORDS",
      tableData,
    });
  };
  const addTableRow = (item: any = {}) => {
    setTableData((prev) => [...prev, item]);
  };
  const getTableRecords = () => state.tableData;
  const searchRefresh = useCallback(async () => {
    if (!isShowPage) {
      await fetchTableData();
      return;
    }
    skipPageEffectRef.current = true;
    await fetchTableData({ currentPage: 1 });
  }, [fetchTableData, isShowPage]);

  const patchRow = useCallback(
    (key: string | number, patch: Record<string, unknown>) => {
      dispatch({ type: "PATCH_ROW", rowKey: key, rowKeyField, patch });
    },
    [dispatch, rowKeyField],
  );

  apiRef.current.getTableData = fetchTableData;
  apiRef.current.getTableRecords = getTableRecords;
  apiRef.current.setTableData = setTableData;
  apiRef.current.addTableRow = addTableRow;
  apiRef.current.searchRefresh = searchRefresh;
  apiRef.current.patchRow = patchRow;

  const onPaginationChange = useCallback<NonNullable<TableProps["onChange"]>>(
    (pagination, _filters, _sorter, extra) => {
      if (extra.action === "paginate") {
        dispatch({
          type: "SET_PAGE_SIZE",
          currentPage: pagination.current,
          pageSize: pagination.pageSize,
        });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (skipPageEffectRef.current) {
      skipPageEffectRef.current = false;
      return;
    }
    isRequest && void fetchTableData();
  }, [fetchTableData, reloadKey, state.currentPage, state.pageSize]);

  /** 只在 onTableReady 引用变化时注册；方法体通过 apiRef 保持最新 */
  useEffect(() => {
    onTableReady?.(apiRef.current);
  }, [onTableReady]);

  useImperativeHandle(
    ref,
    () => ({
      getTableData: () => apiRef.current.getTableData(),
      getTableRecords: () => apiRef.current.getTableRecords(),
      setTableData: (data) => apiRef.current.setTableData?.(data),
      addTableRow: (row) => apiRef.current.addTableRow?.(row),
      searchRefresh: () => apiRef.current.searchRefresh?.() ?? Promise.resolve(),
      patchRow: (key, patch) => apiRef.current.patchRow?.(key, patch),
    }),
    [],
  );

  const paginationConfig: TablePaginationConfig | false = useMemo(
    () =>
      isShowPage
        ? {
            current: state.currentPage,
            pageSize: state.pageSize,
            total: state.total,
            showTotal: (total: number) => `共 ${total} 条`,
            showSizeChanger: true,
          }
        : false,
    [isShowPage, state.currentPage, state.pageSize, state.total],
  );

  return {
    state,
    getTableData: fetchTableData,
    onPaginationChange,
    paginationConfig,
  };
}
