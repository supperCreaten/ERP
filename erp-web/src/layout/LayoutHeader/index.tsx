import type { ButtonProps } from "antd";
import { useDeviceType } from "@/hooks/use-device-type";
import { usePreferences } from "@/hooks/use-preferences";
import { useLayout } from "@/hooks/use-layout";
import { GlobalSearch } from "@/layout/widgets/global-search";
import { NotificationContainer } from "@/layout/widgets/notification/notification-container";
import { Preferences } from "@/layout/widgets/preferences";
import { FullscreenButton } from "./components/fullscreen-button";
import { UserMenu } from "./components/user-menu";
// import { useTabsStore } from "@/store/tabs";
import { useLayoutNestedTheme } from "@/hooks/use-layout-nested-theme";
import { cn, useAppDispatch } from "@/utils/methods";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import AntButton from "@/components/BasicButton";
import { ConfigProvider, theme } from "antd";
import { setSidebarCollapsed } from "@/store/modules/preferences";

import { headerHeight } from "../constants";
import React from "react";

export interface LayoutHeaderProps {
  className?: string
  children?: React.ReactNode
}

const buttonProps: ButtonProps = {
  size: "large",
  className: "px-[11px]",
};

export default function LayoutHeader({ className, children }: LayoutHeaderProps) {
  const {
    sidebarCollapsed,
    isMenuDark,
  } = usePreferences();
  const nestedTheme = useLayoutNestedTheme(isMenuDark);
  const { isMobile } = useDeviceType();
  const { isTopNav } = useLayout();
  const dispatch = useAppDispatch();

  return (
    <ConfigProvider theme={nestedTheme}>
      <LayoutHeaderContent
        className={className}
        isMenuDark={isMenuDark}
        isMobile={isMobile}
        isTopNav={isTopNav}
        sidebarCollapsed={sidebarCollapsed}
        onToggleMobileMenu={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
      >
        {children}
      </LayoutHeaderContent>
    </ConfigProvider>
  );
}

function LayoutHeaderContent({
  className,
  children,
  isMenuDark,
  isMobile,
  isTopNav,
  sidebarCollapsed,
  onToggleMobileMenu,
}: {
  className?: string
  children?: React.ReactNode
  isMenuDark: boolean
  isMobile: boolean
  isTopNav: boolean
  sidebarCollapsed: boolean
  onToggleMobileMenu: () => void
}) {
  const {
    token: { Menu },
  } = theme.useToken();

  return (
      <header
        className={cn(
          "shrink-0 flex gap-5 justify-between items-center transition-[height,padding] md:px-4",
          className,
        )}
        style={{
          background: isMenuDark ? Menu?.darkItemBg : Menu?.itemBg,
          height: headerHeight,
        }}
      >

        {
          isMobile && !isTopNav
            ? (
              <AntButton
                type="text"
                aria-label={sidebarCollapsed ? "关闭菜单" : "打开菜单"}
                icon={sidebarCollapsed ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                onClick={onToggleMobileMenu}
                className="h-full shrink-0"
              />
            )
            : null
        }

        <div className="flex items-center grow h-full overflow-hidden">
          {children}
        </div>

        <div className="flex items-center">
          <GlobalSearch />
          <Preferences {...buttonProps} />
          <FullscreenButton {...buttonProps} target={document.documentElement} />
          <NotificationContainer {...buttonProps} />
          <UserMenu {...buttonProps} />
        </div>
      </header>
  );
}
