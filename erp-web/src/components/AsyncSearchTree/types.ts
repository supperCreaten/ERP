import type { Key, ReactNode } from "react"

/** 通用异步树节点 */
export type AsyncTreeNode<T = Record<string, unknown>> = {
  key: string
  title: string
  isLeaf?: boolean
  loaded?: boolean
  children?: AsyncTreeNode<T>[]
  /** 业务自定义数据，选中时原样回传 */
  data?: T
  icon?: ReactNode
}

export type AsyncSearchTreeSelectInfo<T = Record<string, unknown>> = {
  selected: boolean
  keys: Key[]
  node?: AsyncTreeNode<T>
  data?: T
}

export type AsyncSearchTreeRef<T = Record<string, unknown>> = {
  /** 清空搜索、选中、展开 */
  reset: () => void
  /** 当前选中节点的业务数据 */
  getSelectedData: () => T | undefined
}

export type AsyncSearchTreeProps<T = Record<string, unknown>> = {
  /** 加载根节点 */
  loadRoots: () => Promise<AsyncTreeNode<T>[]>
  /** 远程加载子节点；不传则视为静态树 */
  loadChildren?: (node: AsyncTreeNode<T>) => Promise<AsyncTreeNode<T>[]>
  /** 搜索时是否预取未加载子节点（默认：存在 loadChildren 时为 true） */
  prefetchOnSearch?: boolean
  searchPlaceholder?: string
  showIcon?: boolean
  className?: string
  /** 是否展示搜索框，默认 true */
  showSearch?: boolean
  onSelect?: (info: AsyncSearchTreeSelectInfo<T>) => void
}
