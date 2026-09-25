import { forwardRef, useCallback, useMemo, useState, type CSSProperties, type ReactNode, type Ref } from "react"
import { flushSync } from "react-dom"
import AntButton from "@/components/BasicButton"
import BasicForm from "@/components/BasicForm"
import { FormProps, Space } from "antd"
import { DownOutlined, ReloadOutlined, SearchOutlined, UpOutlined } from "@ant-design/icons"
import { FormConfig, FormRef } from "@/interface"
import { cn, getValueFromTtim } from "@/utils/methods"
import useAutoResize from "@/hooks/use-resize"
import { useSearchBox } from "@/hooks/use-searchBox"
import { DEFAULT_COLLAPSED_VISIBLE, DEFAULT_FIELDS_PER_ROW } from "./constants"

const LABEL_COL = { flex: "90px" }
const WRAPPER_COL = { flex: "1" }

export type SearchBoxProps = {
  formConfig: FormConfig[]
  onSearch: () => void | Promise<void>
  /** 重置表单后、触发查询前执行（如清除左侧树选中等外部筛选） */
  onReset?: () => void
  otherFormConfig?: FormProps
  extra?: ReactNode
  /** 收起时展示的筛选项数量，默认 3 */
  collapsedVisibleCount?: number
  /** 搜索区每行最多筛选项数，默认 3（通过 CSS 响应式生效） */
  fieldsPerRow?: number
  /** 搜索按钮文案，默认「查询」 */
  searchButtonText?: string
}

function SearchBox(
  {
    formConfig,
    otherFormConfig = {},
    onSearch,
    onReset,
    extra,
    collapsedVisibleCount = DEFAULT_COLLAPSED_VISIBLE,
    fieldsPerRow = DEFAULT_FIELDS_PER_ROW,
    searchButtonText = "查询",
  }: SearchBoxProps,
  ref: Ref<FormRef>,
) {
  const { state, dispatch } = useSearchBox()
  const { containerRef, maxHeight, recalculate } = useAutoResize(false, {
    auto: true,
    strategy: "viewport",
  })
  const [actionLoading, setActionLoading] = useState(false)

  const fieldCount = formConfig.length
  const expandable = fieldCount > collapsedVisibleCount
  const collapsedLayout = !expandable || state.collapsed

  const fieldsGridStyle = useMemo(
    (): CSSProperties => ({
      ["--search-box-fields-per-row" as string]: `${fieldsPerRow}`,
    }),
    [fieldsPerRow],
  )

  const runSearch = useCallback(async () => {
    setActionLoading(true)
    try {
      await Promise.resolve(onSearch())
    } finally {
      setActionLoading(false)
    }
  }, [onSearch])

  const handleReset = useCallback(async () => {
    setActionLoading(true)
    try {
      if (ref && "current" in ref) {
        ref.current?.resetFields()
      }
      onReset?.()
      await Promise.resolve(onSearch())
    } finally {
      setActionLoading(false)
    }
  }, [onReset, onSearch, ref])

  const toggleCollapse = useCallback(() => {
    const nextCollapsed = !state.collapsed
    queueMicrotask(() => {
      flushSync(() => {
        dispatch({ type: "SET_COLLAPSED", collapsed: nextCollapsed })
      })
    })
    if (!nextCollapsed) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => recalculate())
      })
    }
  }, [dispatch, recalculate, state.collapsed])

  const fieldsPanelStyle: CSSProperties | undefined =
    !collapsedLayout && maxHeight > 0 ? { maxHeight, overflow: "auto" } : undefined

  const {
    className: formClassName,
    labelCol: customLabelCol,
    wrapperCol: customWrapperCol,
    ...restFormConfig
  } = otherFormConfig

  const toolbar = (
    <Space size={8} wrap={false} className="app-search-box__toolbar-inner">
      <AntButton icon={<ReloadOutlined />} loading={actionLoading} onClick={() => handleReset()}>
        重置
      </AntButton>
      <AntButton type="primary" icon={<SearchOutlined />} loading={actionLoading} onClick={() => runSearch()}>
        {searchButtonText}
      </AntButton>
      {expandable && (
        <AntButton type="link" className="app-search-box__toggle" disabled={actionLoading} onClick={toggleCollapse}>
          {collapsedLayout ? "展开" : "收起"}
          {collapsedLayout ? <DownOutlined /> : <UpOutlined />}
        </AntButton>
      )}
      {extra}
    </Space>
  )

  return (
    <section className="app-search-box" data-search-box>
      <BasicForm
        ref={ref}
        otherFormConfig={{
          layout: "horizontal",
          size: "middle",
          colon: true,
          labelCol: customLabelCol ?? LABEL_COL,
          wrapperCol: customWrapperCol ?? WRAPPER_COL,
          onFinish: () => void runSearch(),
          className: cn("app-search-box__form", formClassName),
          ...restFormConfig,
        }}
      >
        <div
          className={cn(
            "app-search-box__split",
            collapsedLayout ? "app-search-box__split--collapsed" : "app-search-box__split--expanded",
          )}
        >
          <div ref={containerRef} className="app-search-box__fields-panel" style={fieldsPanelStyle}>
            <div className="app-search-box__fields-grid" style={fieldsGridStyle}>
              {formConfig.map((item, index) => {
                const fieldName = item.formItemProps?.name
                const fieldKey =
                  fieldName != null && `${fieldName}`.trim() !== "" ? `${fieldName}` : `search-field-${index}`
                return (
                  <div
                    key={fieldKey}
                    className={cn(
                      "app-search-box__field",
                      collapsedLayout && index >= collapsedVisibleCount && "app-search-box__field--folded",
                    )}
                  >
                    <BasicForm.Item
                      {...item.formItemProps}
                      getValueFromEvent={
                        item.formItemProps?.getValueFromEvent
                          ? item.formItemProps?.type === "text"
                            ? (event) => {
                                const data = item.formItemProps?.getValueFromEvent
                                  ? item.formItemProps.getValueFromEvent(event)
                                  : event
                                return getValueFromTtim(data)
                              }
                            : item.formItemProps.getValueFromEvent
                          : item.formItemProps?.type === "text"
                            ? getValueFromTtim
                            : undefined
                      }
                    >
                      {item.component}
                    </BasicForm.Item>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="app-search-box__toolbar-panel">{toolbar}</div>
        </div>
      </BasicForm>
    </section>
  )
}

const SearchBoxForward = forwardRef<FormRef, SearchBoxProps>(SearchBox)
SearchBoxForward.displayName = "SearchBox"
export default SearchBoxForward
export { DEFAULT_COLLAPSED_VISIBLE, DEFAULT_FIELDS_PER_ROW } from "./constants"
