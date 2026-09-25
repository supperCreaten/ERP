import { loadingContainerId } from "./loading";

const ARMED = "data-hide-loading-armed";

/** 同一颗首屏节点只淡出一次，避免路由切换时重复执行造成卡顿 */
export function hideLoading () {
  const el = document.querySelector(
    `#${loadingContainerId}`,
  ) as HTMLElement | null;
  if (!el?.isConnected || el.getAttribute(ARMED)) return;
  el.setAttribute(ARMED, "1");
  el.setAttribute(
    "style",
    "visibility: hidden; opacity: 0; transition: all 0.6s ease-out;",
  );
  el.addEventListener(
    "transitionend",
    () => {
      el.remove();
    },
    { once: true },
  );
}
