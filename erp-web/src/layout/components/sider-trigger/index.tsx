import AntButton from "@/components/BasicButton";
import { cn, useAppDispatch } from "@/utils/methods";
import { siderTriggerHeight } from "../../constants";
import { setSidebarCollapsed } from "@/store/modules/preferences";
import { useSelector } from "react-redux";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
interface SiderTriggerProps {
  className?: string
}

export function SiderTrigger ({ className }: SiderTriggerProps) {
  const { sidebarCollapsed, sidebarTheme } = useSelector((state: { preferences: any }) => state.preferences)
  const dispatch = useAppDispatch();
  return (
    <AntButton
      type="text"
      style={{
        boxShadow: "0px -3px 5px 0 rgb(29, 35, 41, 0.05)",
        height: siderTriggerHeight,
      }}
      icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
      className={cn(
        "w-full rounded-none border-t",
        className,
        sidebarTheme === "light" ? "border-t-colorBorderSecondary" : "border-t-[#303030]",
      )}
    />

  );
}
