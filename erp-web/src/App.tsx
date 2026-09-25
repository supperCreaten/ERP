import { ConfigProvider } from "antd";
import Router from "./router";
import AntdApp from "@/components/AntdApp";
import { StyleProvider } from "@ant-design/cssinjs";
import { JSSThemeProvider } from "./components/JssThemeProvider";
import { shallowEqual, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { buildAntdThemeConfig } from "./styles/theme/build-antd-theme";
import { useMemo } from "react";
import { SIDE_COLLAPSED_WIDTH } from "@/hooks/use-layout/constants";

export default function App() {
  const { themeRadius, themeColorPrimary } = useSelector(
    (state: RootState) => ({
      themeRadius: state.preferences.themeRadius,
      themeColorPrimary: state.preferences.themeColorPrimary,
    }),
    shallowEqual,
  );

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
