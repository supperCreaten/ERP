import type { FullscreenButtonProps } from "@/components/FullscreenButton";

import { FullscreenButton as FullscreenButtonComponent } from "@/components/FullscreenButton";
import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export function FullscreenButton({ target, ...restProps }: FullscreenButtonProps) {
  return (
    <Tooltip title="全屏">
      <FullscreenButtonComponent
        {...restProps}
        target={target}
        fullscreenExitIcon={<FullscreenExitOutlined />}
        fullscreenIcon={<FullscreenOutlined />}
      />
    </Tooltip>
  );
}
