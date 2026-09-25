import type { ButtonProps } from "antd";
import type { RefObject } from "react";
import AntButton from "@/components/BasicButton";
import { useFullscreen } from "ahooks";
import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";

export interface FullscreenButtonProps extends Omit<ButtonProps, "target"> {
  target: HTMLElement | (() => Element) | RefObject<Element>
  fullscreenIcon?: React.ReactNode
  fullscreenExitIcon?: React.ReactNode
}

/**
 * 全屏按钮组件
 *
 * @param target 全屏目标元素
 * @param fullscreenIcon 全屏时图标
 * @param fullscreenExitIcon 退出全屏时图标
 * @param restProps 其他属性
 * @returns 返回全屏按钮组件
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  target,
  fullscreenIcon,
  fullscreenExitIcon,
  ...restProps
}) => {
  const [isFullscreen, { toggleFullscreen }] = useFullscreen(target);

  return (
    <AntButton
      type="text"
      {...restProps}
      icon={!isFullscreen ? <FullscreenOutlined /> : <FullscreenExitOutlined />}
      onClick={toggleFullscreen}
    />
  );
};
