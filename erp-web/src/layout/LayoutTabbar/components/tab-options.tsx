import type { MenuProps } from "antd";

import AntButton from "@/components/BasicButton";
import { cn } from "@/utils/methods";

// import { DownOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { useState } from "react";

import { useDropdownMenu } from "../hooks/use-dropdown-menu";
import { Icon } from "@iconify/react";

/**
 * TabOptions组件的属性接口
 * @interface TabOptionsProps
 * @property {string} activeKey - 当前激活的标签页的key
 */
interface TabOptionsProps {
  activeKey: string
  className?: string
}

/**
 * TabOptions组件
 * 用于显示标签页的操作选项下拉菜单
 * @param {TabOptionsProps} props - 组件属性
 * @returns {JSX.Element} TabOptions组件
 */
export function TabOptions({ activeKey, className }: TabOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, onClickMenu] = useDropdownMenu();

  /**
   * 处理下拉菜单的显示状态变化
   * @param {boolean} open - 菜单是否打开
   */
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  /**
   * 处理菜单项点击事件
   * @param {object} param - 点击事件参数
   * @param {string} param.key - 被点击的菜单项的key
   */
  const onClick: MenuProps["onClick"] = ({ key }) => {
    onClickMenu(key, activeKey);
    setIsOpen(false);
  };

  return (
    <Dropdown
      trigger={["click"]}
      menu={{ items: items(activeKey), onClick }}
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <AntButton
        className={cn(className)}
        size="middle"
        type="text"
        // icon={<DownOutlined />}
        icon={<Icon icon="ant-design:down-outlined" />}
      />
    </Dropdown>
  );
}
