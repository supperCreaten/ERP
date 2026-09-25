/// <reference types="vite/client" />

/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";
  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_API_MAX_CONCURRENT?: string;
  readonly VITE_BASE_HOME_PATH: string;
  readonly VITE_BASE_Title: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import type { MessageInstance } from "antd/es/message/interface";
import type { ModalStaticFunctions } from "antd/es/modal/confirm";
import type { NotificationInstance } from "antd/es/notification/interface";

declare global {
  interface Window {
    $message: MessageInstance;
    $modal: Omit<ModalStaticFunctions, "warn">;
    $notification: NotificationInstance;
  }
}
