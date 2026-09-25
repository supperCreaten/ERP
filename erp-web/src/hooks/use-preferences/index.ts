import type { PreferencesState } from "@/interface";
import { initialState as DEFAULT_PREFERENCES } from "@/store/modules/preferences";

import { useMemo } from "react";
import { useSelector } from "react-redux";

/**
 * 包装用户偏好设置；主题已固定为浅色，仅侧边栏可独立深色。
 */
export function usePreferences() {
  const preferences = useSelector((state: { preferences: PreferencesState }) => state.preferences);
  const { sidebarTheme } = preferences;
  const isDark = false;
  const isMenuDark = sidebarTheme === "dark";
  const menuTheme: "light" | "dark" = isMenuDark ? "dark" : "light";
  const isDefault = useMemo(() => {
    return Object.entries(DEFAULT_PREFERENCES).every(([key, value]) => {
      return preferences[key as keyof typeof preferences] === value;
    });
  }, [preferences]);
  return {
    ...preferences,
    isDefault,
    isDark,
    isMenuDark,
    menuTheme,
    isLight: true,
  };
}
