import type { ButtonProps } from "antd";

import AntButton from "@/components/BasicButton";
import { useDeviceType } from "@/hooks/use-device-type";
import { usePreferences } from "@/hooks/use-preferences";

import { Badge, theme as antdTheme, ConfigProvider, FloatButton, Tooltip } from "antd";
import { useState } from "react";
import AppDrawer from "@/components/BasicDrawer";

import { Animation, General, PreferencesLayout, Sidebar, Tabbar } from "./blocks";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import { cn } from "@/utils/methods";
import type { RootState } from "@/store/modules";
import { SettingOutlined } from "@ant-design/icons";

const preferencesContentId = "__react-antd-admin__preferences_drawer__";
export function Preferences({ className, ...restProps }: ButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useDeviceType();
  const { isDefault } = usePreferences();
  const preferencesState = useSelector((state: RootState) => state.preferences) as RootState["preferences"] & {
    reset?: () => void;
  };
  const reset = preferencesState.reset;

  const handleCopyPreferences = () => {};
  const clearAndLogout = () => {};

  /** 分区标题放在正常文档流中，避免 Ant Divider 文字骑线导致滚动到顶部时被裁切 */
  const sectionDivider = (label: string) => (
    <div className="preferences-section-divider" role="separator" aria-label={label}>
      <span className="preferences-section-divider__line" aria-hidden />
      <span className="preferences-section-divider__text">{label}</span>
      <span className="preferences-section-divider__line" aria-hidden />
    </div>
  );

  return (
    <>
      <AntButton
        type="text"
        {...restProps}
        className={cn("!text-colorTextSecondary hover:!bg-colorFillSecondary hover:!text-colorText", className)}
        onClick={(e) => {
          restProps?.onClick?.(e);
          setIsOpen(true);
        }}
      >
        <Tooltip title="偏好设置">
          <SettingOutlined />
        </Tooltip>
      </AntButton>
      <ConfigProvider
        theme={{
          /** 与参考图一致：偏好面板固定为亮色 Ant Design 规范 */
          algorithm: antdTheme.defaultAlgorithm,
        }}
      >
        <AppDrawer
          scrollable={false}
          rootClassName="preferences-drawer"
          closable={false}
          title={
            <div className="flex w-full items-center gap-2">
              <AntButton
                type="text"
                aria-label="关闭"
                className="!flex !h-9 !w-9 !shrink-0 !items-center !justify-center !text-[rgba(0,0,0,0.45)] hover:!bg-[rgba(0,0,0,0.06)] hover:!text-[rgba(0,0,0,0.88)]"
                icon={<Icon icon="ri:close-line" className="text-xl" />}
                onClick={() => setIsOpen(false)}
              />
              <div className="min-w-0 flex-1 truncate text-center text-base font-semibold text-[rgba(0,0,0,0.88)]">
                偏好设置
              </div>
              <Tooltip
                title="将当前偏好恢复为系统默认值"
                placement="bottomRight"
                getPopupContainer={() => document.body}
              >
                <Badge dot={!isDefault} color="#1677ff" offset={[-4, 4]}>
                  <AntButton
                    type="text"
                    aria-label="重置为默认"
                    className="!flex !h-9 !shrink-0 !items-center !gap-1 !px-2 !text-[rgba(0,0,0,0.65)] hover:!bg-[rgba(0,0,0,0.06)] hover:!text-[rgba(0,0,0,0.88)]"
                    icon={<Icon icon="ri:refresh-line" className="text-base" />}
                    onClick={() => {
                      if (!isDefault && typeof reset === "function") reset();
                    }}
                  >
                    <span className="whitespace-nowrap text-sm">重置为默认</span>
                  </AntButton>
                </Badge>
              </Tooltip>
            </div>
          }
          placement="right"
          onClose={() => {
            setIsOpen(false);
          }}
          classNames={{
            header: "!mb-0 !border-0 !px-5 !py-3.5",
            body: "!bg-white !px-5 !pb-10 !pt-3",
            footer: "!m-0 !border-t !border-[#f0f0f0] !bg-white !px-5 !py-3",
            ...(isMobile ? {} : { content: "!rounded-l-lg !overflow-hidden !bg-white" }),
          }}
          footer={
            <div className="flex items-center justify-between gap-3">
              <AntButton type="primary" icon={<Icon icon="ri:file-copy-line" className="text-base" />} onClick={handleCopyPreferences} className="!h-9 !rounded-md !px-4 !shadow-none">
                复制偏好设置
              </AntButton>
              <AntButton type="link" className="!h-auto !p-0 !text-[rgba(0,0,0,0.88)] hover:!text-[#1677ff]" onClick={clearAndLogout}>
                清空缓存 & 退出登录
              </AntButton>
            </div>
          }
          {...(isMobile
            ? {
                width: "100vw",
              }
            : {
                width: 408,
              })}
          open={isOpen}
          id={preferencesContentId}
        >
          <div className="flex w-full flex-col">
            {sectionDivider("通用")}
            <General />
            {sectionDivider("布局")}
            <PreferencesLayout />
            {sectionDivider("侧边栏")}
            <Sidebar />
            {sectionDivider("标签栏")}
            <Tabbar />
            {sectionDivider("动画")}
            <Animation />
          </div>
          <FloatButton.BackTop
            type="default"
            shape="circle"
            icon={<Icon icon="ri:rocket-2-line" className="text-lg" />}
            className="!right-5 !bottom-24 !h-10 !w-10 !border !border-[#d9d9d9] !bg-white !text-[rgba(0,0,0,0.45)] !shadow-md hover:!text-[#1677ff]"
            target={() => document.querySelector(`#${preferencesContentId} .ant-drawer-body`) as HTMLElement}
          />
        </AppDrawer>
      </ConfigProvider>
    </>
  );
}
