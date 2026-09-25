import type { MenuItemType } from "@/interface";
import type { ReactElement } from "react";

// import { CloseOutlined } from "@ant-design/icons";
import AntButton from "@/components/BasicButton";
import { clsx } from "clsx";
import { cloneElement, isValidElement } from "react";
import { Icon } from "@iconify/react";
// import { useTranslation } from "react-i18next";

interface SearchPanelProps {
  menuItem: MenuItemType
  setActiveKey: (activeKey: string) => void
  enter: (isLink?: boolean) => void
  removeHistoryItem: (key: string) => void
  active: boolean
  showCloseButton: boolean
}

export function SearchPanel({ menuItem, active, enter, setActiveKey, showCloseButton, removeHistoryItem }: SearchPanelProps) {

  const isExternalLink = isValidElement(menuItem?.meta?.title);

  function handleMouseEnter(key: string) {
    setActiveKey(key);
  }

  return (
    <>
      <li
        data-search-item={menuItem.key}
        onMouseEnter={() => {
          handleMouseEnter(menuItem.key);
        }}
        onClick={() => enter(isExternalLink)}
        className={clsx(
          "flex cursor-pointer flex-col rounded-lg px-4 py-2.5 transition-colors duration-150",
          active
            ? "bg-[#4e73df] text-white"
            : "bg-[#f5f5f5] text-[#262626] hover:bg-[#ebebeb]",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center">
            {menuItem.meta?.icon && (
              <div
                className={clsx(
                  "mr-2.5 shrink-0 text-[18px] [&_.anticon]:text-[inherit]",
                  active ? "text-white/90" : "text-[#595959]",
                )}
              >
                {menuItem.meta.icon}
              </div>
            )}
            <span className="truncate text-sm font-medium leading-snug">{isValidElement(menuItem?.meta?.title) ? cloneElement(menuItem.meta.title, {}, (menuItem.meta.title as ReactElement<{ children: string }>)?.props?.children) : menuItem?.meta?.title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <div
              className={clsx(
                "max-w-[55%] truncate font-mono text-[12px] leading-snug sm:max-w-[60%]",
                active ? "text-white/70" : "text-[#8c8c8c]",
              )}
            >
              {menuItem.key}
            </div>
            <AntButton
              className={clsx(
                { hidden: !showCloseButton },
                active ? "!text-white/90 hover:!bg-white/10" : "!text-[#8c8c8c] hover:!bg-[#e8e8e8]",
              )}
              size="small"
              ghost={false}
              type="text"
              shape="circle"
              icon={<Icon icon="ri:close-line" />}
              onClick={(e) => {
                e.stopPropagation();
                removeHistoryItem(menuItem.key);
              }}
            />
          </div>
        </div>
      </li>
    </>
  );
}
