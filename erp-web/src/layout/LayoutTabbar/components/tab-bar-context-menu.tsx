import type { MenuProps, TabsProps } from "antd";
import { Dropdown } from "antd";

type DefaultTabBar = Parameters<Required<TabsProps>["renderTabBar"]>[1];
type TabBarProps = Parameters<Required<TabsProps>["renderTabBar"]>[0];

export interface TabBarContextMenuProps {
  tabBarProps: TabBarProps;
  DefaultTabBar: DefaultTabBar;
  items: (tabKey: string) => MenuProps["items"];
  onClickMenu: (menuKey: string, nodeKey: string) => void;
  menuClassName?: string;
}

/**
 * 为每个标签绑定右键菜单（与顶部「更多」下拉能力一致）
 */
export function TabBarContextMenu({
  tabBarProps,
  DefaultTabBar,
  items,
  onClickMenu,
  menuClassName,
}: TabBarContextMenuProps) {
  return (
    <DefaultTabBar {...tabBarProps}>
      {(node) => (
        <Dropdown
          key={node.key}
          trigger={["contextMenu"]}
          menu={{
            items: items(`${node.key}`),
            className: menuClassName,
            onClick: ({ key: menuKey }) => onClickMenu(menuKey, `${node.key}`),
          }}
        >
          {node}
        </Dropdown>
      )}
    </DefaultTabBar>
  );
}
