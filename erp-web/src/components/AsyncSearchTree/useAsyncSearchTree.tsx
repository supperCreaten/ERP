import type { EventDataNode } from "rc-tree/lib/interface"
import { Key, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { AsyncTreeNode } from "./types"

function matchTitle(title: string, keyword: string) {
  return title.toLowerCase().includes(keyword.toLowerCase())
}

function filterTree<T>(nodes: AsyncTreeNode<T>[], keyword: string): AsyncTreeNode<T>[] {
  if (!keyword.trim()) return nodes
  const result: AsyncTreeNode<T>[] = []
  for (const node of nodes) {
    const selfMatch = matchTitle(node.title, keyword)
    const filteredChildren = node.children ? filterTree(node.children, keyword) : undefined
    if (selfMatch) {
      result.push(node)
    } else if (filteredChildren?.length) {
      result.push({ ...node, children: filteredChildren })
    }
  }
  return result
}

function collectExpandedKeys<T>(nodes: AsyncTreeNode<T>[], keyword: string): Key[] {
  if (!keyword.trim()) return []
  const keys: Key[] = []
  const hasMatchInTree = (node: AsyncTreeNode<T>): boolean => {
    if (matchTitle(node.title, keyword)) return true
    return node.children?.some((child) => hasMatchInTree(child)) ?? false
  }
  const walk = (list: AsyncTreeNode<T>[]) => {
    for (const node of list) {
      if (node.children?.length && node.children.some((child) => hasMatchInTree(child))) {
        keys.push(node.key)
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return Array.from(new Set(keys))
}

function updateChildren<T>(list: AsyncTreeNode<T>[], key: string, children: AsyncTreeNode<T>[]): AsyncTreeNode<T>[] {
  return list.map((item) => {
    if (item.key === key) {
      return { ...item, children, loaded: true, isLeaf: children.length === 0 }
    }
    if (item.children?.length) {
      return { ...item, children: updateChildren(item.children, key, children) }
    }
    return item
  })
}

function findNode<T>(list: AsyncTreeNode<T>[], key: Key): AsyncTreeNode<T> | undefined {
  for (const item of list) {
    if (item.key === key) return item
    if (item.children?.length) {
      const found = findNode(item.children, key)
      if (found) return found
    }
  }
}

function collectUnloadParents<T>(nodes: AsyncTreeNode<T>[]): AsyncTreeNode<T>[] {
  const result: AsyncTreeNode<T>[] = []
  const walk = (list: AsyncTreeNode<T>[]) => {
    for (const node of list) {
      if (!node.isLeaf && !node.loaded && !node.children) {
        result.push(node)
      }
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}

type Options<T> = {
  loadRoots: () => Promise<AsyncTreeNode<T>[]>
  loadChildren?: (node: AsyncTreeNode<T>) => Promise<AsyncTreeNode<T>[]>
  prefetchOnSearch?: boolean
  onSelect?: (info: {
    selected: boolean
    keys: Key[]
    node?: AsyncTreeNode<T>
    data?: T
  }) => void
}

export function useAsyncSearchTree<T = Record<string, unknown>>(options: Options<T>) {
  const { loadRoots, loadChildren, prefetchOnSearch, onSelect } = options
  const shouldPrefetch = prefetchOnSearch ?? !!loadChildren

  const [loading, setLoading] = useState(false)
  const [rawData, setRawData] = useState<AsyncTreeNode<T>[]>([])
  const [searchValue, setSearchValue] = useState("")
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([])
  const [autoExpandParent, setAutoExpandParent] = useState(false)
  const selectedDataRef = useRef<T | undefined>(undefined)
  const prefetchingRef = useRef<Set<string>>(new Set())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const refreshRoots = useCallback(async () => {
    setLoading(true)
    try {
      const list = await loadRoots()
      setRawData(list ?? [])
    } finally {
      setLoading(false)
    }
  }, [loadRoots])

  useEffect(() => {
    refreshRoots()
  }, [refreshRoots])

  useEffect(() => {
    const keyword = searchValue.trim()
    if (!keyword || !shouldPrefetch || !loadChildren) return

    let cancelled = false
    const targets = collectUnloadParents(rawData).filter((n) => !prefetchingRef.current.has(n.key))
    if (!targets.length) {
      setExpandedKeys(collectExpandedKeys(rawData, keyword))
      setAutoExpandParent(true)
      return
    }
    (async () => {
      await Promise.all(
        targets.map(async (node) => {
          prefetchingRef.current.add(node.key)
          try {
            const children = await loadChildren(node)
            if (cancelled) return
            setRawData((origin) => {
              const next = updateChildren(origin, node.key, children ?? [])
              setExpandedKeys(collectExpandedKeys(next, keyword))
              setAutoExpandParent(true)
              return next
            })
          } finally {
            prefetchingRef.current.delete(node.key)
          }
        }),
      )
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const filteredData = useMemo(() => filterTree(rawData, searchValue), [rawData, searchValue])

  const treeData = useMemo(() => {
    const loop = (data: AsyncTreeNode<T>[]): any[] =>
      data.map((item) => {
        const keyword = searchValue.trim()
        const index = keyword ? item.title.toLowerCase().indexOf(keyword.toLowerCase()) : -1
        const title: ReactNode =
          index > -1 ? (
            <span>
              {item.title.substring(0, index)}
              <span className="async-search-tree-highlight">
                {item.title.substring(index, index + keyword.length)}
              </span>
              {item.title.slice(index + keyword.length)}
            </span>
          ) : (
            <span>{item.title}</span>
          )
        return {
          ...item,
          title,
          key: item.key,
          isLeaf: item.isLeaf,
          loaded: item.loaded,
          icon: item.icon,
          data: item.data,
          children: item.children ? loop(item.children) : undefined,
        }
      })
    return loop(filteredData)
  }, [filteredData, searchValue])

  const onLoadData = (treeNode: EventDataNode<any>) => {
    return new Promise<void>(async (resolve) => {
      if (!loadChildren || treeNode.isLeaf || treeNode.loaded || treeNode.children) {
        resolve()
        return
      }
      try {
        const source = findNode(rawData, treeNode.key) ?? (treeNode as unknown as AsyncTreeNode<T>)
        const children = await loadChildren(source)
        setRawData((origin) => updateChildren(origin, String(treeNode.key), children ?? []))
      } finally {
        resolve()
      }
    })
  }

  const onSearchChange = (value: string) => {
    setSearchValue(value)
    if (value.trim()) {
      setExpandedKeys(collectExpandedKeys(rawData, value))
      setAutoExpandParent(true)
    } else {
      setAutoExpandParent(false)
    }
  }

  const onExpand = (keys: Key[]) => {
    setExpandedKeys(keys)
    setAutoExpandParent(false)
  }

  const handleSelect = (keys: Key[], info: { node: any; selected: boolean }) => {
    const { node, selected } = info
    if (!selected || !keys.length) {
      selectedDataRef.current = undefined
      setSelectedKeys([])
      onSelectRef.current?.({ selected: false, keys: [], node: undefined, data: undefined })
      return
    }
    const source = findNode(rawData, node.key) ?? (node as AsyncTreeNode<T>)
    selectedDataRef.current = source.data
    setSelectedKeys(keys)
    onSelectRef.current?.({ selected: true, keys, node: source, data: source.data })
  }

  const reset = useCallback(() => {
    selectedDataRef.current = undefined
    setSelectedKeys([])
    setSearchValue("")
    setExpandedKeys([])
    setAutoExpandParent(false)
  }, [])

  const getSelectedData = useCallback(() => selectedDataRef.current, [])

  return {
    loading,
    treeData,
    searchValue,
    selectedKeys,
    expandedKeys,
    autoExpandParent,
    onLoadData: loadChildren ? onLoadData : undefined,
    onSearchChange,
    onExpand,
    onSelect: handleSelect,
    reset,
    getSelectedData,
    refreshRoots,
  }
}
