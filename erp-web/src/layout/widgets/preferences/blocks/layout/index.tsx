import { MixedNavigationIcon, SideNavigationIcon, TopNavigationIcon, TwoColumnNavigationIcon } from "@/icons/local-icons";
import type { NavigationType } from "@/interface";
import { MIXED_NAVIGATION, SIDE_NAVIGATION, TOP_NAVIGATION, TWO_COLUMN_NAVIGATION } from "@/layout/widgets/preferences/blocks/layout/constants";
import { RootState } from "@/store";
import { setNavigationStyle } from "@/store/modules/preferences";
import { cn, useAppDispatch } from "@/utils/methods";
import { Icon } from "@iconify/react";

import { Tooltip } from "antd";
import { useSelector } from "react-redux";

const CARD_BORDER = "border border-solid border-[#d9d9d9]";
const CARD_ACTIVE = "border-2 border-solid border-[#1677ff]";

export function PreferencesLayout() {
  const { navigationStyle } = useSelector((state: RootState) => state.preferences);
  const dispatch = useAppDispatch()
  const navigationPreset = [
    {
      name: "侧边导航",
      tip: "左侧竖向主菜单，经典后台布局。",
      icon: <SideNavigationIcon className="h-[0.63em] text-[4rem] en-US:text-[9rem]" />,
      type: SIDE_NAVIGATION,
    },
    {
      name: "顶部导航",
      tip: "顶部横向主导航。",
      icon: <TopNavigationIcon className="h-[0.63em] text-[4rem] en-US:text-[9rem]" />,
      type: TOP_NAVIGATION,
    },
    {
      name: "双列导航",
      tip: "左侧双列菜单，适合菜单层级较多的场景。",
      icon: <TwoColumnNavigationIcon className="h-[0.63em] text-[4rem] en-US:text-[9rem]" />,
      type: TWO_COLUMN_NAVIGATION,
    },
    {
      name: "混合导航",
      tip: "顶部一级菜单 + 左侧子菜单。",
      icon: <MixedNavigationIcon className="h-[0.63em] text-[4rem] en-US:text-[9rem]" />,
      type: MIXED_NAVIGATION,
    },
  ] as const;

  function handleClick(value: NavigationType) {
    dispatch(setNavigationStyle(value))
  }

  return (
    <ul className="m-0 grid w-full list-none grid-cols-4 gap-2 p-0">
      {navigationPreset.map((item) => (
        <li key={item.type} className="min-w-0">
          <button type="button" onClick={() => handleClick(item.type)} className="w-full cursor-pointer border-0 bg-transparent p-0 text-left">
            <div className={cn("flex flex-col items-center rounded-md bg-white px-1 py-2 transition-colors", item.type === navigationStyle ? CARD_ACTIVE : CARD_BORDER)}>
              <div className="flex h-[52px] w-full items-center justify-center text-[rgba(0,0,0,0.88)]">{item.icon}</div>
              <div className="mt-2 flex items-center justify-center gap-0.5 text-xs text-[rgba(0,0,0,0.88)]">
                <span>{item.name}</span>
                <Tooltip title={item.tip} placement="bottom">
                  <Icon icon="ri:question-line" className="text-[rgba(0,0,0,0.45)]" />
                </Tooltip>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
