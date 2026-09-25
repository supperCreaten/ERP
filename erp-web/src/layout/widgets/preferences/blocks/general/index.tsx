import { useSelector } from "react-redux";

import { SelectItem } from "../../select-item";
import { SwitchItem } from "../../switch-item";
import { TextInput } from "../../text-input";
import { getLanguageItems } from "./utils";
import { RootState } from "@/store";
import { useAppDispatch } from "@/utils/methods";
import { setPreferences } from "@/store/modules/preferences";

export function General() {
  const { language, watermark, watermarkContent } = useSelector((state: RootState) => state.preferences);
  const dispatch = useAppDispatch();
  return (
    <>
      <SelectItem name="language" value={language} items={getLanguageItems()}>
        语言
      </SelectItem>

      <SwitchItem
        name="watermark"
        checked={watermark}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value }))}
        tooltip="开启后将在页面显示水印文字。"
      >
        水印
      </SwitchItem>

      <TextInput
        name="watermarkContent"
        value={watermarkContent}
        disabled={!watermark}
        onChange={(name, value) => dispatch(setPreferences({ [name]: value }))}
      >
        水印内容
      </TextInput>
    </>
  );
}
