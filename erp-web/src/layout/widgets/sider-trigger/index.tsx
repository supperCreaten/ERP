import AntButton from "@/components/BasicButton";

import { usePreferences } from "@/hooks/use-preferences";
import { cn, useAppDispatch } from "@/utils/methods";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import { siderTriggerHeight } from "../../constants";
import { setSidebarCollapsed } from "@/store/modules/preferences";

interface SiderTriggerProps {
  className?: string
}

export function SiderTrigger({ className }: SiderTriggerProps) {
  const { sidebarCollapsed, sidebarTheme } = usePreferences();
  const dispatch = useAppDispatch();
  return (
    <AntButton
      type="text"
      style={{
        boxShadow: "0px -3px 5px 0 rgb(29, 35, 41, 0.05)",
        height: siderTriggerHeight,
      }}
      icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed ))}
      className={cn(
        "w-full rounded-none border-t",
        className,
        sidebarTheme === "dark" ? "border-t-[#303030]" : "border-t-colorBorderSecondary",
      )}
    />

  );
}
