import type { TabsProps } from "antd";
import { Tabs } from "antd";
import { clsx } from "clsx";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { DraggableTabBar } from "./components/draggable-tab-bar";
import { TabOptions } from "./components/tab-options";
import { TabActionKeys, useDropdownMenu } from "./hooks/use-dropdown-menu";
import { useTabItems } from "./hooks/use-tab-items";
import { useTabRouteSync } from "./hooks/use-tab-route-sync";
import { useStyles } from "./style";

/**
 * 多标签栏：路由同步、右键菜单、拖拽排序、更多操作
 */
export default function LayoutTabbar() {
  const classes = useStyles();
  const {
    tabbarStyleType,
    tabbarShowMore,
  } = useSelector((state: RootState) => state.preferences);

  const [menuItems, onClickMenu] = useDropdownMenu();
  const { handleTabChange, activeKey } = useTabRouteSync();
  const openTabs = useSelector((state: RootState) => state.tab.openTabs);
  const tabItems = useTabItems(openTabs);

  const handleEditTabs = useCallback<Required<TabsProps>["onEdit"]>(
    (key, action) => {
      if (action === "remove") {
        onClickMenu(TabActionKeys.CLOSE, key as string);
      }
    },
    [onClickMenu],
  );

  const renderTabBar = useCallback<Required<TabsProps>["renderTabBar"]>(
    (tabBarProps, DefaultTabBar) => (
      <DraggableTabBar
        tabBarProps={tabBarProps}
        DefaultTabBar={DefaultTabBar}
        tabItems={tabItems}
        items={menuItems}
        onClickMenu={onClickMenu}
        menuClassName={classes.tabBarContextMenu}
      />
    ),
    [tabItems, menuItems, onClickMenu, classes.tabBarContextMenu],
  );

  return (
    <div className={classes.tabsContainer}>
      <div className="flex min-w-0 items-center">
        <Tabs
          className={clsx(
            "min-w-0 flex-1",
            classes.resetTabs,
            tabbarStyleType === "brisk" ? classes.brisk : "",
            tabbarStyleType === "plain" ? classes.plain : "",
            tabbarStyleType === "chrome" ? classes.chrome : "",
            tabbarStyleType === "card" ? classes.card : "",
          )}
          size="small"
          hideAdd
          animated={{ inkBar: true, tabPane: false }}
          onChange={handleTabChange}
          activeKey={activeKey}
          type="editable-card"
          onEdit={handleEditTabs}
          items={tabItems}
          renderTabBar={renderTabBar}
        />
        {tabbarShowMore ? (
          <div className="flex shrink-0 items-center border-l border-(--ant-color-border-secondary) pl-1">
            <TabOptions activeKey={activeKey} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
