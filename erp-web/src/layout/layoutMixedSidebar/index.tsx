import type { MenuProps } from "antd";
import { Scrollbar } from "@/components/Scrollbar";
import { useLayoutNestedTheme } from "@/hooks/use-layout-nested-theme";
import { usePreferences } from "@/hooks/use-preferences";
import { FIRST_COLUMN_WIDTH_IN_TWO_COLUMN_NAVIGATION } from "@/hooks/use-layout/constants";

import { ConfigProvider, Typography, theme as antdTheme } from "antd";

import { sidebarTitleHeight, siderTriggerHeight } from "../constants";
import LayoutMenu from "../LayoutMenu";
import { SiderTrigger } from "../widgets/sider-trigger";
import FirstColumnMenu from "./firstColumnMenu";
import { MenuItemType } from "@/interface";

interface LayoutMixedSidebarProps {
  computedSidebarWidth?: number
  topNavItems?: MenuItemType[]
  sideNavItems?: MenuItemType[]
  sideNavMenuKeyInSplitMode?: string
  handleMenuSelect?: (key: string, mode: MenuProps["mode"]) => void
}

const emptyArray: MenuItemType[] = [];
const zero = 0;
/**
 * 双列布局侧边栏
 */
export default function LayoutMixedSidebar({
  computedSidebarWidth = zero,
  sideNavItems = emptyArray,
  topNavItems = emptyArray,
  handleMenuSelect,
  sideNavMenuKeyInSplitMode,
}: LayoutMixedSidebarProps) {
  const { isMenuDark, sidebarCollapsed } = usePreferences();
  const nestedTheme = useLayoutNestedTheme(isMenuDark);
  const firstColumnWidthInTwoColumnNavigation = FIRST_COLUMN_WIDTH_IN_TWO_COLUMN_NAVIGATION;

  return (
    <ConfigProvider theme={nestedTheme}>
      <LayoutMixedSidebarContent
        computedSidebarWidth={computedSidebarWidth}
        firstColumnWidthInTwoColumnNavigation={firstColumnWidthInTwoColumnNavigation}
        isMenuDark={isMenuDark}
        sidebarCollapsed={sidebarCollapsed}
        sideNavMenuKeyInSplitMode={sideNavMenuKeyInSplitMode}
        topNavItems={topNavItems}
        sideNavItems={sideNavItems}
        handleMenuSelect={handleMenuSelect}
      />
    </ConfigProvider>
  );
}

function LayoutMixedSidebarContent({
  computedSidebarWidth,
  firstColumnWidthInTwoColumnNavigation,
  isMenuDark,
  sidebarCollapsed,
  sideNavMenuKeyInSplitMode,
  topNavItems,
  sideNavItems,
  handleMenuSelect,
}: {
  computedSidebarWidth: number
  firstColumnWidthInTwoColumnNavigation: number
  isMenuDark: boolean
  sidebarCollapsed: boolean
  sideNavMenuKeyInSplitMode?: string
  topNavItems: MenuItemType[]
  sideNavItems: MenuItemType[]
  handleMenuSelect?: (key: string, mode: MenuProps["mode"]) => void
}) {
  const {
    token: { Menu },
  } = antdTheme.useToken();

  return (
      <aside
        className="fixed left-0 top-0 bottom-0 flex"
        style={{
          backgroundColor: isMenuDark ? Menu?.darkItemBg : Menu?.itemBg,
          boxShadow: "3px 0 5px 0 rgb(29, 35, 41, 0.05)",
        }}
      >
        <FirstColumnMenu sideNavMenuKeyInSplitMode={sideNavMenuKeyInSplitMode} menus={topNavItems} handleMenuSelect={handleMenuSelect} />
        <div style={{ width: computedSidebarWidth - firstColumnWidthInTwoColumnNavigation }} className="relative transition-[width]">
          {
            !sidebarCollapsed
              ? (
                <Typography.Title level={1} ellipsis className="flex items-center my-0 pl-2 text-lg mx-3" style={{ height: sidebarTitleHeight }}>
                  {import.meta.env.VITE_GLOB_APP_TITLE}
                </Typography.Title>
              )
              : null
          }
          <div
            className="overflow-hidden"
            style={{ height: sidebarCollapsed ? `calc(100%  - ${siderTriggerHeight}px)` : `calc(100% - ${sidebarTitleHeight}px - ${siderTriggerHeight}px)` }}
          >
            <Scrollbar>
              <LayoutMenu
                autoExpandCurrentMenu
                menus={sideNavItems}
                handleMenuSelect={handleMenuSelect}
              />
            </Scrollbar>
          </div>
          <SiderTrigger />
        </div>
      </aside>
  );
}
