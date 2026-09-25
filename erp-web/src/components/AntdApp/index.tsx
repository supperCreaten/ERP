import type { ReactNode } from "react";

import { StaticAntd } from "@/utils/static-antd";

import { theme as antdTheme, App } from "antd";
import { useLayoutEffect } from "react";

import { setupAntdThemeTokensToHtml } from "./setup-antd-theme";

export interface AntdAppProps {
  children: ReactNode
}

export default function AntdApp ({ children }: AntdAppProps) {
  const { token: antdTokens } = antdTheme.useToken();

  useLayoutEffect(() => {
    setupAntdThemeTokensToHtml(antdTokens);
  }, [antdTokens]);

  return (
    <App className="h-full">
      <StaticAntd />
      {children}
    </App>
  );
}
