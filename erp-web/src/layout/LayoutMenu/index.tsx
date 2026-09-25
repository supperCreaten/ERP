import type { MenuProps } from "antd"
import type { MenuItemType } from "@/interface"
import { cn } from "@/utils/methods"
import { Menu } from "antd"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useStyles } from "./style"
import useMenu from "@/hooks/use-menu"
import { useDeviceType } from "@/hooks/use-device-type"
import { usePreferences } from "@/hooks/use-preferences"
import { getParentKeys } from "@/utils/menu"

interface LayoutMenuProps {
  mode?: MenuProps["mode"]
  /**
   * 控制是否自动展开当前路由对应的菜单项
   *
   * Why?
   * 注意：当菜单模式为顶部导航模式，菜单 mode 为 horizontal，初次进入页面时，菜单不应自动展开，可以指定 autoExpandCurrentMenu 为 false 关闭自动展开功能
   * @see https://github.com/user-attachments/assets/705ae01d-db7f-4f42-b4dd-66adba0dd68f
   */
  autoExpandCurrentMenu?: boolean
  menus?: MenuItemType[]
  wholeMenus?: MenuItemType[]
  handleMenuSelect?: (key: string, mode: MenuProps["mode"]) => void
}

const emptyArray: MenuItemType[] = []
export default function LayoutMenu({
  mode = "inline",
  autoExpandCurrentMenu,
  handleMenuSelect,
  menus = emptyArray,
  wholeMenus = emptyArray,
}: LayoutMenuProps) {
  const classes = useStyles()
  const { pathname } = useLocation()
  const { sidebarCollapsed, menuTheme } = usePreferences()
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const { getSelectedKeys } = useMenu()
  const { isMobile } = useDeviceType()

  /** 基于当前渲染的菜单树计算父级链路（混合导航侧栏为拆分后的子树） */
  const menuParentKeys = useMemo(() => getParentKeys(wholeMenus), [wholeMenus])

  const menuInlineCollapsedProp = useMemo(() => {
    /* inlineCollapsed 只在 inline 模式可用 */
    if (mode === "inline") {
      return { inlineCollapsed: isMobile ? false : sidebarCollapsed }
    }
    return {}
  }, [mode, isMobile, sidebarCollapsed])

  /**
   * 手风琴：展开某一级时，只保留该菜单的祖先链路 + 自身，收起其余已展开项
   */
  const onOpenChange = useCallback<NonNullable<MenuProps["onOpenChange"]>>(
    (keys) => {
      const latestOpenKey = keys.find((key) => !openKeys.includes(key))
      if (!latestOpenKey) {
        setOpenKeys(keys)
        return
      }
      const parents = menuParentKeys[latestOpenKey] ?? []
      setOpenKeys([...parents, latestOpenKey])
    },
    [menuParentKeys, openKeys],
  )

  const menuOpenProps = useMemo(() => {
    if (mode !== "inline") return {}
    return {
      openKeys,
      onOpenChange,
    }
  }, [mode, openKeys, onOpenChange])

  /**
   * 侧边菜单折叠时关闭全部子菜单；
   * 展开且开启 autoExpandCurrentMenu 时，仅展开当前路由对应的父级链路
   */
  useEffect(() => {
    if (mode !== "inline") return
    if (!isMobile && sidebarCollapsed) {
      setOpenKeys([])
      return
    }
    if (autoExpandCurrentMenu) {
      setOpenKeys(menuParentKeys[pathname] ?? [])
    }
  }, [mode, isMobile, sidebarCollapsed, autoExpandCurrentMenu, pathname, menuParentKeys])

  const handleMenuClick = useCallback<NonNullable<MenuProps["onClick"]>>(
    ({ key }) => {
      handleMenuSelect?.(key, mode)
    },
    [handleMenuSelect, mode],
  )

  return (
    <Menu
      theme={menuTheme}
      /**
       * min-w-0 flex-auto 解决在 Flex 布局中，Menu 没有按照预期响应式省略菜单
       * @see https://ant-design.antgroup.com/components/menu#why-menu-do-not-responsive-collapse-in-flex-layout
       */
      className={cn("app-layout-menu border-none! min-h-full min-w-0 flex-auto", {
        /**
         * @zh 当侧边菜单折叠时，添加背景色
         * @en When the side menu is collapsed, add background color
         */
        [classes.menuBackgroundColor]: sidebarCollapsed,
      })}
      inlineIndent={16}
      style={{ height: isMobile ? "100%" : "initial" }}
      mode={mode}
      items={menus as MenuProps["items"]}
      {...menuInlineCollapsedProp}
      {...menuOpenProps}
      selectedKeys={getSelectedKeys}
      /**
       * 使用 onClick 替代 onSelect：父路由激活子页面时仍可点父级跳转；且 onSelect 内部同步更重，易触发 long click handler。
       * @see https://github.com/user-attachments/assets/cf67a973-f210-45e4-8278-08727ab1b8ce
       */
      onClick={handleMenuClick}
    />
  )
}
