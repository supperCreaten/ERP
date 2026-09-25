import { RootState } from "@/store";
import { setPreferences } from "@/store/modules/preferences";
import { useAppDispatch } from "@/utils/methods";
import type { SelectProps } from "antd";

// import { usePreferencesStore } from "#src/store/preferences";
import { Select } from "antd";
import { useSelector } from "react-redux";

export interface SelectItemProps {
  children: React.ReactNode;
  name: string;
  value?: string;
  disabled?: boolean;
  items: SelectProps["options"];
}

export function SelectItem({ children, items, disabled, value, name }: SelectItemProps) {
  const dispatch = useAppDispatch();
  return (
    <div className="my-0.5 flex min-h-10 w-full items-center justify-between rounded-sm px-3 py-2.5 transition-colors hover:bg-[#fafafa]">
      <span className="flex items-center text-sm text-[rgba(0,0,0,0.88)]">{children}</span>
      <Select className="min-w-[120px] max-w-[52%]" variant="outlined" options={items} disabled={disabled} value={value} onChange={(value) => dispatch(setPreferences({ [name]: value }))} />
    </div>
  );
}
