import { useMemo } from "react";
import type { TabStateType } from "@/store/modules/tabs";

/**
 * 将 openTabs 转为 Ant Design Tabs 的 items
 */
export function useTabItems(openTabs: Map<string, TabStateType>) {
  return useMemo(
    () =>
      Array.from(openTabs.values()).map((item) => {
        const { icon: _icon, ...rest } = item as TabStateType & { icon?: unknown };
        return {
          ...rest,
          label: item.newTabTitle ?? item.label,
        };
      }),
    [openTabs],
  );
}
