import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "react-redux";
import store from "@/store";
import "@ant-design/v5-patch-for-react-19";
import "./styles/index.css";
import { HashRouter } from "react-router-dom";
import { setupLoading } from "./plugins/loading.ts";

// Register service worker for caching and performance
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("Service Worker registered successfully");
      })
      .catch(() => {
        console.log("Service Worker registration failed");
      });
  });
}
setupLoading();
createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
);
