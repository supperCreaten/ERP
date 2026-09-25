import { Space, type SpaceProps } from "antd";

/** 表格操作列 link 按钮：去掉 Ant Design 默认内边距 */
export const TABLE_LINK_BTN_CLASS = "!h-auto !px-0";

/** 表格操作列布局容器 */
export default function TableOperation({ children, size = 8, wrap = false, ...rest }: SpaceProps) {
  return (
    <Space className="table-operation-space" size={size} wrap={wrap} {...rest}>
      {children}
    </Space>
  );
}
