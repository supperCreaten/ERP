import { Scrollbar } from "@/components/Scrollbar"
import { Input, Spin, Tree } from "antd"
import { forwardRef, useImperativeHandle, useMemo, type ForwardedRef, type ReactElement, type Ref } from "react"
import type { AsyncSearchTreeProps, AsyncSearchTreeRef } from "./types"
import { useAsyncSearchTree } from "./useAsyncSearchTree"
import "./index.css"

function AsyncSearchTreeInner<T = Record<string, unknown>>(
  props: AsyncSearchTreeProps<T>,
  ref: ForwardedRef<AsyncSearchTreeRef<T>>,
) {
  const {
    loadRoots,
    loadChildren,
    prefetchOnSearch,
    searchPlaceholder = "搜索",
    showIcon = true,
    showSearch = true,
    className,
    onSelect,
  } = props

  const tree = useAsyncSearchTree<T>({
    loadRoots,
    loadChildren,
    prefetchOnSearch,
    onSelect,
  })

  useImperativeHandle(
    ref,
    () => ({
      reset: tree.reset,
      getSelectedData: tree.getSelectedData,
    }),
    [tree.reset, tree.getSelectedData],
  )

  const rootClassName = useMemo(() => ["async-search-tree", className].filter(Boolean).join(" "), [className])

  return (
    <div className={rootClassName}>
      {showSearch && (
        <Input.Search
          className="mb-2"
          allowClear
          placeholder={searchPlaceholder}
          value={tree.searchValue}
          onChange={(e) => tree.onSearchChange(e.target.value)}
        />
      )}
      <div className="async-search-tree-body">
        <Scrollbar>
          <Spin spinning={tree.loading} className="min-h-80">
            <Tree
              showIcon={showIcon}
              treeData={tree.treeData}
              loadData={tree.onLoadData}
              selectedKeys={tree.selectedKeys}
              expandedKeys={tree.expandedKeys}
              autoExpandParent={tree.autoExpandParent}
              onExpand={tree.onExpand}
              onSelect={tree.onSelect}
            />
          </Spin>
        </Scrollbar>
      </div>
    </div>
  )
}

const AsyncSearchTree = forwardRef(AsyncSearchTreeInner) as <T = Record<string, unknown>>(
  props: AsyncSearchTreeProps<T> & { ref?: Ref<AsyncSearchTreeRef<T>> },
) => ReactElement

export default AsyncSearchTree
export type { AsyncTreeNode, AsyncSearchTreeProps, AsyncSearchTreeRef, AsyncSearchTreeSelectInfo } from "./types"
