import type { RootState } from "@/store";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { hideLoading } from "./hide-loading";
import "./loading-screen.css";

/**
 * 与 setupLoading() 同款的居中三点动画；用于 Suspense fallback 或鉴权等待。
 * 挂载时关闭 index/main 注入的首屏 DOM loading，避免与 React 层叠两套。
 */
export default function LoadingScreen() {
  const themeColorPrimary = useSelector((s: RootState) => s.preferences.themeColorPrimary);

  useEffect(() => {
    hideLoading();
  }, []);

  return (
    <div className="app-loading-screen">
      <div className="app-loading-screen__dots" style={{ color: themeColorPrimary || "#1677ff" }} />
    </div>
  );
}
