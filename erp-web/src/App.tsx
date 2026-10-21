import { ConfigProvider } from "antd";
import Router from "./router";
import AntdApp from "@/components/AntdApp";
import { StyleProvider } from "@ant-design/cssinjs";
import { JSSThemeProvider } from "./components/JssThemeProvider";
import { shallowEqual, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { buildAntdThemeConfig } from "./styles/theme/build-antd-theme";
import { useEffect, useMemo } from "react";
import { SIDE_COLLAPSED_WIDTH } from "@/hooks/use-layout/constants";
import { hideLoading } from "@/plugins/hide-loading";

export default function App() {
  const { themeRadius, themeColorPrimary } = useSelector(
    (state: RootState) => ({
      themeRadius: state.preferences.themeRadius,
      themeColorPrimary: state.preferences.themeColorPrimary,
    }),
    shallowEqual,
  );

  /** Suspense 若命中缓存同步完成，LoadingScreen 可能不挂载；在此兜底关闭 HTML 首屏 loading */
  useEffect(() => {
    hideLoading();
  }, []);

  const antdThemeConfig = useMemo(
    () =>
      buildAntdThemeConfig({
        themeRadius,
        themeColorPrimary,
        sideCollapsedWidth: SIDE_COLLAPSED_WIDTH,
      }),
    [themeRadius, themeColorPrimary],
  );

  return (
    <StyleProvider layer>
      <ConfigProvider input={{ autoComplete: "off" }} theme={antdThemeConfig}>
        <AntdApp>
          <JSSThemeProvider>
            <Router />
          </JSSThemeProvider>
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  );
}
