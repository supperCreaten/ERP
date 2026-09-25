import type { MenuItemType } from "@/interface";
import type { InputRef } from "antd";

import type { ReactElement } from "react";
import { Scrollbar } from "@/components/Scrollbar";
import { useDeviceType } from "@/hooks/use-device-type";
// import { useAccessStore } from "#src/store/access";

import { isString } from "@/utils/is";
// import { SearchOutlined } from "@ant-design/icons";
import { useDebounceFn, useKeyPress, useLocalStorageState } from "ahooks";
import { Empty, Input } from "antd";
import MyDialog from "@/components/BasicDialog";
// import { match } from "pinyin-pro";
import { isValidElement, useEffect, useMemo, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { navigateInTransition } from "@/utils/navigate-transition";

import { clsx } from "clsx";
import { SearchFooter, type GlobalSearchFooterKeyHint } from "./components/search-footer";
import { SearchPanel } from "./components/search-panel";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";

import { RootState } from "@/store";
import { SearchOutlined } from "@ant-design/icons";

/**
 * @zh 偏平化可跳转的菜单项
 * @en Flat menu item that can be jumped
 */
function transformMenuToFlatMenu(menus: MenuItemType[], flatMap: MenuItemType[] = []) {
  if (menus && menus.length === 0) return [];
  return menus.reduce((acc, cur) => {
    if (!cur.children) {
      acc.push(cur);
    }
    if (cur.children && cur.children.length > 0) {
      transformMenuToFlatMenu(cur.children, flatMap);
    }
    return acc;
  }, flatMap);
}

const searchHistoryLocalStorageKey = `__search-history-${location.hostname}__`;

export function GlobalSearch() {
  const { wholeMenus } = useSelector((state: RootState) => state.menu);
  const { isMobile } = useDeviceType();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [resultOptions, setResultOptions] = useState<MenuItemType[]>([]);
  // const t = (title) => title;
  const inputRef = useRef<InputRef>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const footerKeyHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [footerKeyHint, setFooterKeyHint] = useState<GlobalSearchFooterKeyHint>(null);
  const [searchHistory = [], setSearchHistory] = useLocalStorageState<string[]>(searchHistoryLocalStorageKey, {
    defaultValue: [],
  });

  const searchMenuList = useMemo(() => transformMenuToFlatMenu(wholeMenus), [wholeMenus]);

  function onClose() {
    setOpen(false);
  }

  function handleClose() {
    onClose();
    setResultOptions([]);
    setKeyword("");
    setActiveKey("");
  }

  /**
   * @zh 将指定索引的元素滚动到视图中
   * @en Scroll the specified index element into view
   */
  function scrollSelectedIntoView(index: number) {
    if (listRef.current) {
      const item = listRef.current.children[index] as HTMLElement;
      item?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }

  /**
   * @zh 从搜索历史中移除指定的记录
   * @en Remove the specified record from search history
   */
  function removeHistoryItem(key: string) {
    setSearchHistory((prev) => prev!.filter((item) => item !== key));
  }

  function getActivePathIndex() {
    return resultOptions.findIndex((item) => item.key === activeKey);
  }

  function handleKeyPress(direction: 1 | -1) {
    const { length } = resultOptions;
    if (length === 0) return;

    const index = getActivePathIndex();
    if (index === -1) return;

    const activeIndex = (index + direction + length) % length; // 确保 index 在范围内循环
    const activeNameKey = resultOptions[activeIndex].key;

    setActiveKey(activeNameKey);
    scrollSelectedIntoView(activeIndex);
  }

  const { run: setSearch } = useDebounceFn(
    (e) => {
      const inputValue = e.target.value?.trim()?.toLocaleLowerCase();
      if (!inputValue) {
        setResultOptions([]);
        setActiveKey("");
        return;
      }
      const matchRoutes = searchMenuList.filter((menuItem) => {
        let labelText = "";
        if (isValidElement(menuItem.meta.title)) {
          labelText = (menuItem.meta.title as ReactElement<{ children: string }>).props.children;
        }
        if (isString(menuItem.meta.title)) {
          labelText = menuItem.meta.title;
        }
        const translatedLowerCaseLabel = labelText;
        const containsInputValue = translatedLowerCaseLabel?.includes(inputValue);

        return containsInputValue;
      });
      const activeName = matchRoutes[0]?.key ?? "";
      setActiveKey(activeName);
      setResultOptions(matchRoutes);
    },
    { wait: 100 },
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value?.trim();
    setKeyword(inputValue);
  };

  /** key up */
  function handleUp() {
    handleKeyPress(-1); // 方向 -1 表示向上
  }

  /** key down */
  function handleDown() {
    handleKeyPress(1); // 方向 1 表示向下
  }

  /**
   * @zh 快捷键打开搜索面板
   * @en Shortcut key to open the search panel
   */
  useKeyPress(["meta.K"], () => {
    if (!open) {
      setOpen(true);
    }
  });

  /** key enter */
  function handleEnter(isExternalLink?: boolean) {
    if (resultOptions.length === 0 || activeKey === "") return;
    if (!searchHistory?.includes(activeKey)) {
      setSearchHistory([...(searchHistory ?? []), activeKey]);
    }
    handleClose();
    if (isExternalLink) {
      window.open(activeKey);
    } else {
      navigateInTransition(navigate, activeKey);
    }
  }

  useKeyPress("Escape", handleClose);
  useKeyPress("Enter", () => handleEnter());
  useKeyPress("uparrow", handleUp);
  useKeyPress("downarrow", handleDown);

  useEffect(() => {
    if (!keyword.length && Array.isArray(searchHistory)) {
      setResultOptions(searchMenuList.filter((item) => searchHistory?.includes(item.key)));
    }
  }, [keyword, searchHistory]);

  /** 页脚快捷键微动效：与真实按键同步 */
  useEffect(() => {
    if (!open) return;
    const flash = (key: GlobalSearchFooterKeyHint) => {
      setFooterKeyHint(key);
      if (footerKeyHintTimer.current) clearTimeout(footerKeyHintTimer.current);
      footerKeyHintTimer.current = setTimeout(() => {
        setFooterKeyHint(null);
        footerKeyHintTimer.current = null;
      }, 140);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") flash("up");
      else if (e.key === "ArrowDown") flash("down");
      else if (e.key === "Escape") flash("esc");
      else if (e.key === "Enter") flash("enter");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (footerKeyHintTimer.current) clearTimeout(footerKeyHintTimer.current);
    };
  }, [open]);

  return (
    <>
      <div
        onClick={() => setOpen((open) => !open)}
        className="group flex justify-center items-center gap-2 bg-colorFillTertiary p-2.5! rounded-full cursor-pointer text-colorTextSecondary hover:text-colorText md:mr-2.5"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        <SearchOutlined />
        <span className="hidden text-xs font-medium tracking-wide md:block">搜索</span>
        <span className="relative hidden items-center gap-0.5 rounded-md bg-colorFillTertiary px-1.5 py-0.5 font-mono text-[10px] leading-none text-colorTextSecondary md:inline-flex">
          <span aria-hidden>&#x2318;</span>
          <kbd className="font-sans font-semibold">K</kbd>
        </span>
      </div>

      <MyDialog
        open={open}
        onCancel={() => handleClose()}
        afterOpenChange={(visible) => {
          if (visible) {
            inputRef.current?.focus();
          }
        }}
        keyboard
        closable={isMobile}
        centered={!isMobile}
        draggable={false}
        viewportPadding={isMobile ? 0 : 48}
        wrapClassName={isMobile ? undefined : "global-search-modal"}
        rootClassName={isMobile ? undefined : "global-search-modal-root"}
        transitionName=""
        maskTransitionName=""
        classNames={{
          ...(isMobile
            ? {}
            : {
                content: "!overflow-hidden !rounded-lg !p-0",
              }),
          header: "!mb-0 !border-b-0 !pb-0",
          body: "!bg-transparent !pt-0",
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="global-search-input-shell">
              <Input
                ref={inputRef}
                size="middle"
                value={keyword}
                onChange={handleChange}
                onInput={setSearch}
                variant="outlined"
                placeholder="输入关键字搜索菜单（支持拼音）"
                allowClear
                autoFocus
                prefix={<SearchOutlined />}
                name="global-search-input"
              />
            </div>
            {!isMobile && (
              <button type="button" className="global-search-close-outer" aria-label="关闭" onClick={() => handleClose()}>
                <Icon icon="ri:close-line" />
              </button>
            )}
          </div>
        }
        footer={isMobile ? null : <SearchFooter searchItems={resultOptions.length} keyHint={footerKeyHint} />}
        style={isMobile ? { margin: 0, maxWidth: "100%", top: 0, paddingBottom: 0 } : undefined}
        styles={{
          body: {
            flexGrow: "1",
            overflow: "hidden",
            padding: "0 20px 16px",
            background: "transparent",
          },
          header: {
            padding: "20px 20px 16px",
            background: "transparent",
          },
          footer: {
            padding: 0,
            margin: 0,
            background: "transparent",
          },
          content: {
            padding: 0,
            height: isMobile ? "100vh" : undefined,
            display: isMobile ? "flex" : "block",
            flexDirection: isMobile ? "column" : "row",
          },
        }}
        width={isMobile ? "100%" : 580}
      >
        <Scrollbar
          style={{
            maxHeight: isMobile ? "100%" : "min(48vh, 420px)",
          }}
        >
          <ul
            className={clsx(
              "space-y-2.5 pb-3 pt-0 md:pb-2",
              resultOptions.length === 0 && "global-search-results-list--empty",
            )}
            ref={listRef}
          >
            {resultOptions.length === 0 ? (
              <Empty
                className="my-10 py-2"
                styles={{ image: { height: 44 } }}
                image={keyword.length ? <Icon icon="ri:search-line" className="text-colorTextTertiary" style={{ fontSize: 40 }} /> : Empty.PRESENTED_IMAGE_SIMPLE}
                description={keyword.length ? `未找到搜索结果「${keyword}」` : "没有搜索历史"}
              ></Empty>
            ) : (
              resultOptions.map((item) => (
                <SearchPanel
                  key={item.key}
                  active={item.key === activeKey}
                  enter={handleEnter}
                  removeHistoryItem={removeHistoryItem}
                  setActiveKey={setActiveKey}
                  menuItem={item}
                  showCloseButton={keyword.length === 0}
                />
              ))
            )}
          </ul>
        </Scrollbar>
      </MyDialog>
    </>
  );
}
