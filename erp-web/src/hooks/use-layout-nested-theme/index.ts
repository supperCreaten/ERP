import { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { buildLayoutNestedThemeConfig } from "@/styles/theme/build-antd-theme";
import { SIDE_COLLAPSED_WIDTH } from "@/hooks/use-layout/constants";

/** 布局侧栏/顶栏嵌套主题 */
export function useLayoutNestedTheme(isMenuDark: boolean) {
  const { themeColorPrimary, themeRadius } = useSelector(
    (state: RootState) => ({
      themeColorPrimary: state.preferences.themeColorPrimary,
      themeRadius: state.preferences.themeRadius,
    }),
    shallowEqual,
  );

  return useMemo(
    () =>
      buildLayoutNestedThemeConfig(isMenuDark, {
        themeColorPrimary,
        themeRadius,
        sideCollapsedWidth: SIDE_COLLAPSED_WIDTH,
      }),
    [isMenuDark, themeColorPrimary, themeRadius],
  );
}
