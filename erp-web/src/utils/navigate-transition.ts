import { startTransition } from "react";
import type { NavigateFunction, NavigateOptions, To } from "react-router-dom";

/**
 * 路由跳转：`startTransition` 标记为低优先级更新；
 * `queueMicrotask` 把 `navigate` 移出当前「点击」同步栈，避免 Chrome 把整段路由+重渲染
 * 算进 [Violation] 'click' handler took …ms。
 *
 * 勿使用 `Parameters<NavigateFunction>`：`navigate` 有 `(to, opts?)` 与 `(delta: number)` 重载，
 * `Parameters` 会解析到 `number` 分支，导致 `navigateInTransition(navigate, '/path')` 报
 * 类型“string”不能赋给类型“number”。
 */
export function navigateInTransition (
  navigate: NavigateFunction,
  to: To,
  options?: NavigateOptions,
): void {
  queueMicrotask(() => {
    startTransition(() => {
      navigate(to, options);
    });
  });
}
