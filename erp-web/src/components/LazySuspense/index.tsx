import React, { Suspense } from "react";

/**
 * 顶层 Suspense：fallback 保持为空。
 * 菜单页懒加载由 LayoutContent 内容区承接，避免整页 LoadingScreen 盖住侧栏/顶栏造成「切换很慢」。
 * 鉴权等待仍由 AuthGuard 的 LoadingScreen 负责。
 */
export default function lazySuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
