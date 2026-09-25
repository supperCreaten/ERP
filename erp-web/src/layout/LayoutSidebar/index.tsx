import { Scrollbar } from "@/components/Scrollbar"
import { usePreferences } from "@/hooks/use-preferences"
import { useLayoutNestedTheme } from "@/hooks/use-layout-nested-theme"

import { ConfigProvider, theme } from "antd"
import { clsx } from "clsx"
import React from "react"

import { headerHeight, siderTriggerHeight } from "../constants"
import { Logo } from "../components/logo"
import { SiderTrigger } from "../components/sider-trigger"
import { useSidebarResize } from "./use-sidebar-resize"

export interface LayoutSidebarProps {
  children?: React.ReactNode
  computedSidebarWidth: number
}

export default function LayoutSidebar({ children, computedSidebarWidth }: LayoutSidebarProps) {
  const { sidebarCollapsed, isMenuDark } = usePreferences()
  const nestedTheme = useLayoutNestedTheme(isMenuDark)

  return (
    <ConfigProvider theme={nestedTheme}>
      <LayoutSidebarContent
        computedSidebarWidth={computedSidebarWidth}
        isMenuDark={isMenuDark}
        sidebarCollapsed={sidebarCollapsed}
      >
        {children}
      </LayoutSidebarContent>
    </ConfigProvider>
  )
}

function LayoutSidebarContent({
  children,
  computedSidebarWidth,
  isMenuDark,
  sidebarCollapsed,
}: {
  children?: React.ReactNode
  computedSidebarWidth: number
  isMenuDark: boolean
  sidebarCollapsed: boolean
}) {
  const {
    token: { Menu, colorBorderSecondary, colorPrimary },
  } = theme.useToken()
  const { resizing, resizeHandleProps } = useSidebarResize({
    sidebarWidth: computedSidebarWidth,
    disabled: sidebarCollapsed,
  })

  return (
    <aside
      style={{
        width: computedSidebarWidth + 1,
        backgroundColor: isMenuDark ? (Menu?.darkItemBg ?? "#141414") : (Menu?.itemBg ?? "#ffffff"),
        borderRightColor: colorBorderSecondary,
        boxShadow: "3px 0 5px 0 rgb(29, 35, 41, 0.05)",
      }}
      className={clsx(
        "fixed top-0 bottom-0 left-0 overflow-x-hidden overflow-y-auto border-r",
        !resizing && "transition-[width,border-color]",
      )}
    >
      <Logo sidebarCollapsed={sidebarCollapsed} />
      <div
        className="overflow-hidden"
        style={{
          height: `calc(100% - ${headerHeight}px - ${siderTriggerHeight}px)`,
          backgroundColor: "inherit",
        }}
      >
        <Scrollbar>{children}</Scrollbar>
      </div>
      <SiderTrigger />

      {!sidebarCollapsed ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="拖动调整侧边栏宽度"
          title="拖动调整宽度"
          className={clsx(
            "absolute top-0 right-0 z-20 h-full w-1.5 translate-x-1/2 cursor-col-resize touch-none",
            "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent after:transition-colors",
            "hover:after:bg-(--sidebar-resize-color)",
            resizing && "after:bg-(--sidebar-resize-color)",
          )}
          style={
            {
              ["--sidebar-resize-color" as string]: colorPrimary,
            } as React.CSSProperties
          }
          {...resizeHandleProps}
        />
      ) : null}
    </aside>
  )
}
