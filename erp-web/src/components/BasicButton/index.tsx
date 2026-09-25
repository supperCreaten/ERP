import { cn } from "@/utils/methods";
import { Button } from "antd";
import type { ButtonProps } from "antd";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";

export type AntButtonProps = ButtonProps & {
  /** 兼容旧用法，等同 children */
  title?: ReactNode;
  /** 为 true 时，点击后自动 loading 直至 onClick 完成（与受控 loading 二选一） */
  isLoading?: boolean;
};

export function AntButton({
  isLoading = false,
  title,
  type,
  children,
  loading: loadingProp,
  onClick,
  className,
  ...rest
}: AntButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const content = children ?? title;
  const loading = loadingProp !== undefined ? loadingProp : isLoading ? internalLoading : false;
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (!onClick) return;
    const result = onClick(e);
    if (!isLoading || loadingProp !== undefined) return;

    setInternalLoading(true);
    void Promise.resolve(result).finally(() => {
      setInternalLoading(false);
    });
  };

  return (
    <Button {...rest} type={type} loading={loading} onClick={handleClick} className={cn(type !== 'link' ? 'p-3' : 'pl-0 pr-0', className)}>
      {content}
    </Button>
  );
}

export default AntButton;
