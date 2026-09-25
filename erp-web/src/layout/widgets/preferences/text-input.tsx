import { Input } from "antd";

export interface TextInputProps {
  children: React.ReactNode
  name: string
  value?: string
  disabled?: boolean
  onChange?: (name: string, value: string) => void
}

export function TextInput({
  children,
  disabled,
  value,
  name,
  onChange,
}: TextInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event) {
      onChange?.(name, event.target.value);
    }
  };

  return (
    <div className="my-0.5 flex min-h-10 w-full items-center justify-between rounded-sm px-3 py-2.5 transition-colors hover:bg-[#fafafa]">
      <span className="flex items-center text-sm text-[rgba(0,0,0,0.88)]">{children}</span>
      <Input
        className="max-w-[55%]"
        variant="outlined"
        disabled={disabled}
        allowClear
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
