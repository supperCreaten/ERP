import { cn, useAppDispatch } from "@/utils/methods";

import { SwitchItem } from "../../switch-item";
import { useSelector } from "react-redux";
import { setPreferences } from "@/store/modules/preferences";
import { RootState } from "@/store";

const transitionPreset = [
  "fade",
  "fade-slide",
  "fade-up",
  "fade-down",
  "fade-zoom",
];

const CARD_BORDER = "border border-solid border-[#d9d9d9]";
const CARD_ACTIVE = "border-2 border-solid border-[#1677ff]";

export function Animation () {
  const { transitionEnable, transitionLoading, transitionProgress, transitionName } = useSelector((state: RootState) => state.preferences);
  const dispatch = useAppDispatch();
  function handleClick(value: string) {
    dispatch(setPreferences({ transitionName: value }));
  }

  return (
    <>
      <SwitchItem
        name="transitionProgress"
        checked={transitionProgress}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value }))}
      >
        页面切换进度条
      </SwitchItem>
      <SwitchItem
        name="transitionLoading"
        checked={transitionLoading}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value }))}
      >
        页面切换 Loading
      </SwitchItem>
      <SwitchItem
        name="transitionEnable"
        checked={transitionEnable}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value }))}
      >
        页面切换动画
      </SwitchItem>
      <ul className="m-0 flex w-full list-none flex-wrap gap-2 p-0">
        {
          transitionPreset.map(item => (
            <li
              key={item}
              onClick={() => handleClick(item)}
              className={cn(
                "relative p-2! outline outline-gray-300 dark:outline-gray-700 cursor-pointer rounded-md",
                "before:content-[''] before:absolute before:left-1/2 before:top-1/2 before:h-0 before:w-0 before:rounded-sm before:opacity-0 before:outline-solid before:outline-2 before:outline-transparent",
                item === transitionName ? "" : "before:transition-all before:duration-300",
                item === transitionName ? "" : "before:hover:outline-blue-600 dark:before:hover:outline-blue-700 before:hover:left-0 before:hover:top-0 before:hover:h-full before:hover:w-full before:hover:p-1 before:hover:opacity-100",
                { "outline-2 outline-blue-600 dark:outline-blue-700": item === transitionName },
              )}
            >
              <div
                className={cn(
                  "dark:bg-gray-700",
                  "bg-gray-100 h-10 w-12 rounded-md text-xs flex items-center justify-center text-center",
                  {
                    "fade-slide": item === "fade-slide",
                    "fade": item === "fade",
                    "fade-up": item === "fade-up",
                    "fade-down": item === "fade-down",
                    "fade-zoom": item === "fade-zoom",
                  },
                )}
              >
                <span className="scale-75 text-opacity-75">{item}</span>
              </div>
            </li>
          ))
        }
      </ul>
    </>
  );
}
