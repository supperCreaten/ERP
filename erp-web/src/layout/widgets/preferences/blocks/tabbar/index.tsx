import { useSelector } from "react-redux";

import { SelectItem } from "../../select-item";
import { SwitchItem } from "../../switch-item";
import { RootState } from "@/store";
import { useAppDispatch } from "@/utils/methods";
import { setPreferences } from "@/store/modules/preferences";

export function Tabbar() {
  const {
    tabbarEnable,
    tabbarStyleType,
    tabbarShowMore,
  } = useSelector((state: RootState) => state.preferences);
  const dispatch = useAppDispatch();
  const styleItems = [
    { label: "谷歌", value: "chrome" },
    { label: "简约", value: "plain" },
    { label: "卡片", value: "card" },
    { label: "轻快", value: "brisk" },
  ];

  return (
    <>
      <SwitchItem
        name="tabbarEnable"
        checked={tabbarEnable}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value }))}
      >
        显示标签栏
      </SwitchItem>
      <SwitchItem
        name="tabbarShowMore"
        checked={tabbarShowMore}
        disabled={!tabbarEnable}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value }))}
      >
        显示更多按钮
      </SwitchItem>
      <SelectItem
        name="tabbarStyleType"
        value={tabbarStyleType}
        disabled={!tabbarEnable}
        items={styleItems}
      >
        标签页风格
      </SelectItem>
    </>
  );
}
