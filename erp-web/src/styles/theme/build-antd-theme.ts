import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";
import { customAntdLightTheme } from "./antd/antd-theme";

export interface BuildAntdThemeOptions {
  themeColorPrimary?: string
  themeRadius?: number
  sideCollapsedWidth?: number
  /** 布局侧栏/顶栏是否使用深色菜单表面 */
  isMenuDark?: boolean
}

function mergeMenuComponent(
  isMenuDark: boolean,
  baseTheme: ThemeConfig,
  sideCollapsedWidth?: number,
) {
  const menuConfig = isMenuDark
    ? {
        ...baseTheme.components?.Menu,
        darkItemBg: "#141414",
      }
    : {
        ...baseTheme.components?.Menu,
        itemBg: "#fff",
      };

  return {
    ...menuConfig,
    ...(sideCollapsedWidth != null ? { collapsedWidth: sideCollapsedWidth } : {}),
  };
}

/** 统一构建 Ant Design 主题（固定浅色算法；侧栏可单独深色菜单） */
export function buildAntdThemeConfig(options: BuildAntdThemeOptions): ThemeConfig {
  const { themeColorPrimary, themeRadius, sideCollapsedWidth, isMenuDark = false } = options;
  const baseTheme = customAntdLightTheme;
  const effectivePrimary = themeColorPrimary ?? "#1677ff";

  return {
    cssVar: {},
    hashed: false,
    algorithm: isMenuDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    ...baseTheme,
    token: {
      ...baseTheme.token,
      ...(themeRadius != null ? { borderRadius: themeRadius } : {}),
      colorPrimary: effectivePrimary,
    },
    components: {
      ...baseTheme.components,
      Menu: mergeMenuComponent(isMenuDark, baseTheme, sideCollapsedWidth),
    },
  };
}

/** 布局区嵌套 ConfigProvider */
export function buildLayoutNestedThemeConfig(
  isMenuDark: boolean,
  options?: Pick<BuildAntdThemeOptions, "themeColorPrimary" | "themeRadius" | "sideCollapsedWidth">,
): ThemeConfig {
  return buildAntdThemeConfig({
    isMenuDark,
    ...options,
  });
}
