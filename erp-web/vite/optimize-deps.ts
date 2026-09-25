/**
 * 仅预构建入口链路必需依赖。
 * 重型库（antd 整包、echarts、pro-components 等）由静态分析按需发现，
 * 不在冷启动阶段通过 include 强制整包预构建。
 */
export const OPTIMIZE_DEPS_INCLUDE = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "react-router-dom",
  "@ant-design/cssinjs",
  "@ant-design/v5-patch-for-react-19",
  "@reduxjs/toolkit",
  "react-redux",
  "axios",
  "dayjs",
  "immer",
  "clsx",
  "tailwind-merge",
];
