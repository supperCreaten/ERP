import { useCallback, useRef } from "react"
import type { AnyObject } from "antd/es/_util/type"
import type { FormRef } from "@/interface"
import type { BasicTableHandle } from "./types"

/**
 * 列表页常用：SearchBox + BasicTable 联动
 * 封装 searchRef / onTableReady / onGetParams / 刷新方法
 *
 * @typeParam Row 表格行类型，建议与 BasicTable 一致：useBasicTable\<CustomerTableData\>()
 * @typeParam Values 查询表单值类型
 */
export function useBasicTable<
  // 默认 any：使 onTableReady 能赋给 BasicTable\<T\>，避免与具体行类型逆变冲突
  Row extends AnyObject = any,
  Values extends Record<string, unknown> = Record<string, unknown>,
>() {
  const searchRef = useRef<FormRef<Values>>(null)
  const tableApiRef = useRef<BasicTableHandle<Row> | null>(null)

  const onTableReady = useCallback((api: BasicTableHandle<Row>) => {
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

  const patchRow = useCallback((rowKey: string | number, patch: Partial<Row> & AnyObject) => {
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
