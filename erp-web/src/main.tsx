import { setupLoading } from "./plugins/loading.ts";

/** HTML 已内联首屏 loading；此处仅兜底。应用主体静态引入，便于 Vite 注入 modulepreload 并行下载 */
setupLoading();

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "@/store";
import "@ant-design/v5-patch-for-react-19";
import "./styles/index.css";
import { HashRouter } from "react-router-dom";

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    const base = import.meta.env.BASE_URL || "./";
    const swUrl = `${base.endsWith("/") ? base : `${base}/`}sw.js`;
    navigator.serviceWorker.register(swUrl).catch(() => {
      /* 注册失败不影响主流程 */
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
);
