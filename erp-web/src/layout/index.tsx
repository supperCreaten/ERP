import React, { useMemo } from "react"
import { Watermark } from "antd"
import LayoutMenu from "./LayoutMenu"
import { cn } from "@/utils/methods"
import LayoutHeader from "./LayoutHeader"
import { Logo } from "./components/logo"
import useMenu from "@/hooks/use-menu"
import { useLayout } from "@/hooks/use-layout"
import { useDeviceType } from "@/hooks/use-device-type"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import LayoutSidebar from "./LayoutSidebar"
import LayoutContent from "./LayoutContent"
import LayoutTabbar from "./LayoutTabbar"
import LayoutMixedSidebar from "./layoutMixedSidebar"
import LayoutMobileMenu from "./layoutMobileMenu"
export default function LayoutContainer() {
  const { topNavItems, sideNavItems, wholeMenus, sideNavMenuKeyInSplitMode, handleMenuSelect } = useMenu()
  const {
    isTopNav,
    isMixedNav,
    isTwoColumnNav,
    firstColumnWidthInTwoColumnNavigation,
    sideCollapsedWidth,
    sidebarWidth,
  } = useLayout()
  const { isMobile } = useDeviceType()
  const { sidebarEnable, sidebarCollapsed, tabbarEnable, watermark, watermarkContent } = useSelector(
    (state: RootState) => state.preferences,
  )
  const sidebarEnableState = useMemo(() => !isTopNav && sidebarEnable, [isTopNav, sidebarEnable])
  const computedSidebarWidth = useMemo(() => {
    if (isMobile) {
      return 0
    }
    const currentSidebarWidth = sidebarCollapsed ? sideCollapsedWidth : sidebarWidth
    if (isTwoColumnNav) {
      /* 双列导航，第一列默认宽度 */
      return currentSidebarWidth + (firstColumnWidthInTwoColumnNavigation ?? 0)
    }
    if (sidebarEnableState) {
      return currentSidebarWidth
    }
    return 0
  }, [
    isMobile,
    isTwoColumnNav,
    sidebarEnableState,
    sidebarWidth,
    sidebarCollapsed,
    sideCollapsedWidth,
    firstColumnWidthInTwoColumnNavigation,
  ])

  const layoutBody = (
    <>
      {sidebarEnableState && !isTwoColumnNav && !isMobile ? (
        <LayoutSidebar computedSidebarWidth={computedSidebarWidth}>
          <LayoutMenu
            autoExpandCurrentMenu
            menus={sideNavItems}
            handleMenuSelect={handleMenuSelect}
            wholeMenus={wholeMenus}
          />
        </LayoutSidebar>
      ) : null}
      {sidebarEnableState && !isTopNav ? <LayoutMobileMenu /> : null}
      <section
        style={{
          paddingLeft: computedSidebarWidth,
        }}
        className={cn("layout-main-section transition-[padding-left] flex h-full min-h-0 flex-col overflow-hidden")}
      >
        <LayoutHeader>
          {isTopNav || isMixedNav ? (
            <>
              {isTopNav ? <Logo sidebarCollapsed={false} className="mr-8" /> : null}
              <LayoutMenu mode="horizontal" menus={topNavItems} handleMenuSelect={handleMenuSelect} />
            </>
          ) : null}
        </LayoutHeader>
        {tabbarEnable ? <LayoutTabbar /> : null}
        {isTwoColumnNav ? (
          <LayoutMixedSidebar
            sideNavMenuKeyInSplitMode={sideNavMenuKeyInSplitMode}
            computedSidebarWidth={computedSidebarWidth}
            sideNavItems={sideNavItems}
            topNavItems={topNavItems}
            handleMenuSelect={handleMenuSelect}
          />
        ) : null}
        <LayoutContent />
      </section>
    </>
  )

  return (
    <div className="h-full min-h-0 overflow-hidden">
      {watermark ? (
        <Watermark content={watermarkContent || "erp"} className="block h-full">
          {layoutBody}
        </Watermark>
      ) : (
        <div className="block h-full">{layoutBody}</div>
      )}
    </div>
  )
}
