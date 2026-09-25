import { SwitchItem } from "../../switch-item";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { RootState } from "@/store";
import { useAppDispatch } from "@/utils/methods";
import { setPreferences } from "@/store/modules/preferences";

export function Sidebar() {
  const {
    sidebarEnable,
    sidebarCollapsed,
    sidebarTheme,
  } = useSelector((state: RootState) => state.preferences);
  const dispatch = useAppDispatch();

  const handleChange = (name: string, value: unknown) => {
    dispatch(setPreferences({ [name]: value }));
  };

  return (
    <>
      <SwitchItem
        name="sidebarEnable"
        checked={!!sidebarEnable}
        onChange={handleChange}
      >
        显示侧边栏
      </SwitchItem>
      <SwitchItem
        name="sidebarCollapsed"
        checked={sidebarCollapsed}
        onChange={handleChange}
        disabled={!sidebarEnable}
      >
        折叠菜单
      </SwitchItem>
      <SwitchItem
        name="sidebarTheme"
        checked={sidebarTheme === "light"}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value ? "light" : "dark" }))}
        disabled={!sidebarEnable}
        unCheckedChildren={<Icon icon="ri:contrast-fill" />}
        checkedChildren={<Icon icon="ri:moon-line" />}
      >
        侧边栏主题
      </SwitchItem>
    </>
  );
}
