import { Scrollbar } from "@/components/Scrollbar";
import { useDeviceType } from "@/hooks/use-device-type";
import { usePreferences } from "@/hooks/use-preferences";
import { cn, useAppDispatch } from "@/utils/methods";

import type { MenuProps } from "antd";
import { theme as antdTheme } from "antd";
import { useCallback } from "react";
import { createUseStyles } from "react-jss";
import AppDrawer from "@/components/BasicDrawer";

import LayoutMenu from "../LayoutMenu";
import useMenu from "@/hooks/use-menu";
import { setSidebarCollapsed } from "@/store/modules/preferences";


const useStyles = createUseStyles({
  drawerStyles: {
    "& .ant-drawer-body": {
      "padding": 0,
      "&>ul": {
        paddingTop: "1em",
      },
    },
    "& .ant-drawer-header": {
      display: "none",
    },
  },
});

export default function LayoutMobileMenu() {
  const classes = useStyles();
  const { token: { Menu } } = antdTheme.useToken();
  const { sidebarCollapsed, isMenuDark } = usePreferences();
  const { isMobile } = useDeviceType();
  const { sideNavItems, handleMenuSelect } = useMenu();
  const dispatch = useAppDispatch();

  const handleMobileMenuSelect = useCallback(
    (key: string, mode: MenuProps["mode"]) => {
      handleMenuSelect(key, mode);
      dispatch(setSidebarCollapsed(false));
    },
    [dispatch, handleMenuSelect],
  );

  return (
    isMobile
      ? (
        <AppDrawer
          scrollable={false}
          styles={{
            body: {
              backgroundColor: isMenuDark ? Menu?.darkItemBg : Menu?.itemBg,
            },
          }}
          open={sidebarCollapsed}
          placement="left"
          width="clamp(200px, 50vw, 210px)"
          className={cn(classes.drawerStyles)}
          onClose={() => dispatch(setSidebarCollapsed(false))}
        >
          <Scrollbar>
            <LayoutMenu
              autoExpandCurrentMenu
              menus={sideNavItems}
              handleMenuSelect={handleMobileMenuSelect}
            />
          </Scrollbar>
        </AppDrawer>
      )
      : null
  );
}
