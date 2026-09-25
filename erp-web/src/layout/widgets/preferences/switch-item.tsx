import { Icon } from "@iconify/react";
import type { SwitchProps } from "antd";
// import { QuestionCircleOutlined } from "@ant-design/icons";

import { Switch, Tooltip } from "antd";

export interface SwitchItemProps extends Omit<SwitchProps, "onChange"> {
  children: React.ReactNode
  name: string
  onChange?: (a: string, b: unknown) => void
  tooltip?: React.ReactNode
}

export function SwitchItem({ tooltip, children, disabled, checked, name, onChange, ...restProps }: SwitchItemProps) {
  return (
    <div className="my-0.5 flex min-h-10 w-full items-center justify-between rounded-sm px-3 py-2.5 transition-colors hover:bg-[#fafafa]">
      <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
        <span className="text-sm text-[rgba(0,0,0,0.88)]">{children}</span>
        {tooltip
          ? (
            <Tooltip title={tooltip}>
              <Icon icon="ri:question-line" className="shrink-0 text-[rgba(0,0,0,0.45)]" />
            </Tooltip>
          )
          : null}
      </div>
      <Switch
        disabled={disabled}
        checked={checked}
        size="default"
        onChange={() => onChange?.(name, !checked)}
        {...restProps}
      />
    </div>
  );
}
