import type { MenuProps } from "antd";

import { Scrollbar } from "@/components/Scrollbar";
import { usePreferences } from "@/hooks/use-preferences";
import { FIRST_COLUMN_WIDTH_IN_TWO_COLUMN_NAVIGATION } from "@/hooks/use-layout/constants";
import { ConfigProvider, Menu } from "antd";

import { clsx } from "clsx";
import { createUseStyles } from "react-jss";

import { headerHeight } from "../constants";
import { Logo } from "../widgets/logo";
import { MenuItemType } from "@/interface";

const useStyles = createUseStyles(({ token }:{ token: any }) => {
  return {
    menu: {
      "& .ant-menu-item": {
        "gap": token.sizeXS,
        "height": "60px",
        "display": "flex",
        "flexDirection": "column",
        "alignItems": "center",
        "justifyContent": "center",
        "& .ant-menu-title-content": {
          lineHeight: "initial",
          margin: "0px !important",
          fontSize: token.fontSizeIcon,
        },
      },
    },
  };
});

interface FirstColumnMenuProps {
  menus?: MenuItemType[]
  sideNavMenuKeyInSplitMode?: string
  handleMenuSelect?: (key: string, mode: MenuProps["mode"]) => void
}

const emptyArray: MenuItemType[] = [];
export default function FirstColumnMenu({
  handleMenuSelect,
  menus = emptyArray,
  sideNavMenuKeyInSplitMode,
}: FirstColumnMenuProps) {
  const classes = useStyles();
  const { isMenuDark, menuTheme } = usePreferences();
  const firstColumnWidth = FIRST_COLUMN_WIDTH_IN_TWO_COLUMN_NAVIGATION;

  return (

    <div
      style={{
        width: firstColumnWidth,
      }}
      className={clsx("border-r h-full", isMenuDark ? "border-r-[#303030]" : "border-r-colorBorderSecondary")}
    >
      <Logo sidebarCollapsed />
      <Scrollbar style={{ height: `calc(100% - ${headerHeight}px)` }}>
        <ConfigProvider theme={{
          components: {
            Menu: {
              collapsedWidth: firstColumnWidth - 1,
            },
          },
        }}
        >
          <Menu
            mode="vertical"
            // inlineCollapsed
            selectedKeys={[sideNavMenuKeyInSplitMode ?? ""]}
            className={clsx(classes.menu, "app-layout-menu")}
            items={menus as MenuProps["items"]}
            theme={menuTheme}
            /**
             * 使用 onClick 替代 onSelect 事件，原因是当子路由激活父菜单时，点击父菜单依然可以正常导航。
             * @see https://github.com/user-attachments/assets/cf67a973-f210-45e4-8278-08727ab1b8ce
             */
            onClick={({ key }) => handleMenuSelect?.(key, "horizontal")}
          />
        </ConfigProvider>
      </Scrollbar>
    </div>
  );
}
