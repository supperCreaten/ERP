import { useCallback, useRef } from "react"
import type { FormRef } from "@/interface"
import type { BasicTableHandle } from "./types"

/**
 * 列表页常用：SearchBox + BasicTable 联动
 * 封装 searchRef / onTableReady / onGetParams / 刷新方法
 */
export function useBasicTable<Values extends Record<string, unknown> = Record<string, unknown>>() {
  const searchRef = useRef<FormRef<Values>>(null)
  const tableApiRef = useRef<BasicTableHandle | null>(null)

  const onTableReady = useCallback((api: BasicTableHandle) => {
    tableApiRef.current = api
  }, [])

  /** 按当前页刷新 */
  const refreshTable = useCallback(() => tableApiRef.current?.getTableData(), [])

  /** 查询：重置到第 1 页再请求（无 searchRefresh 时回退 getTableData） */
  const searchRefresh = useCallback(
    () => tableApiRef.current?.searchRefresh?.() ?? tableApiRef.current?.getTableData(),
    [],
  )

  const onGetParams = useCallback(() => {
    return (searchRef.current?.getFieldsValue(true) ?? {}) as Values
  }, [])

  const patchRow = useCallback((rowKey: string | number, patch: Record<string, unknown>) => {
    tableApiRef.current?.patchRow?.(rowKey, patch)
  }, [])

  return {
    searchRef,
    onTableReady,
    onGetParams,
    refreshTable,
    searchRefresh,
    patchRow,
    /** 给 SearchBox 的 onSearch 用 */
    onSearch: searchRefresh,
  }
}
