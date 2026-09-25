import type { ReactNode } from "react";
import { Drawer, Spin, type DrawerProps } from "antd";
import { cn } from "@/utils/methods";

const FLEX_SPIN_WRAPPER_CLASS =
  "flex min-h-0 flex-1 flex-col [&_.ant-spin-container]:flex [&_.ant-spin-container]:min-h-0 [&_.ant-spin-container]:flex-1 [&_.ant-spin-container]:flex-col";

const DEFAULT_SCROLL_CLASS = "min-h-0 flex-1 overflow-y-auto px-6 py-4";

const FLEX_DRAWER_CLASS_NAMES: DrawerProps["classNames"] = {
  content: "!flex !flex-col",
  body: "!flex !min-h-0 !flex-1 !flex-col !overflow-hidden !p-0",
  footer: "!py-3 !px-6",
};

type DrawerClassNames = NonNullable<DrawerProps["classNames"]>;

function mergeDrawerClassNames(base?: DrawerProps["classNames"], override?: DrawerProps["classNames"]) {
  if (!base) return override;
  if (!override) return base;

  const keys = new Set([...Object.keys(base), ...Object.keys(override)]) as Set<keyof DrawerClassNames>;
  const merged: DrawerProps["classNames"] = {};

  keys.forEach((key) => {
    merged[key] = cn(base[key], override[key]);
  });

  return merged;
}

export type AppDrawerProps = Omit<DrawerProps, "loading"> & {
  /** Spin 加载状态 */
  loading?: boolean;
  /** Spin 提示文案 */
  spinTip?: string;
  /** 是否启用 flex:1 可滚动内容区布局，详情类抽屉默认 true */
  scrollable?: boolean;
  /** 可滚动内容区额外 className */
  contentClassName?: string;
  /** 额外的 Drawer 属性，可覆盖主属性 */
  otherProps?: DrawerProps;
  children?: ReactNode;
};

export default function AppDrawer({
  loading = false,
  spinTip,
  scrollable = true,
  contentClassName,
  classNames,
  children,
  otherProps,
  open,
  ...rest
}: AppDrawerProps) {
  const {
    classNames: otherClassNames,
    open: otherOpen,
    ...restOtherProps
  } = otherProps ?? {};

  const mergedOpen = open ?? otherOpen;
  const mergedClassNames = scrollable ? mergeDrawerClassNames(FLEX_DRAWER_CLASS_NAMES, classNames ?? otherClassNames) : (classNames ?? otherClassNames);

  const content = scrollable ? (
    <Spin spinning={loading} tip={spinTip} wrapperClassName={FLEX_SPIN_WRAPPER_CLASS}>
      <div className={cn(DEFAULT_SCROLL_CLASS, contentClassName)}>{children}</div>
    </Spin>
  ) : (
    <Spin spinning={loading} tip={spinTip}>
      {children}
    </Spin>
  );

  return (
    <Drawer classNames={mergedClassNames} open={mergedOpen} {...rest} {...restOtherProps}>
      {content}
    </Drawer>
  );
}
