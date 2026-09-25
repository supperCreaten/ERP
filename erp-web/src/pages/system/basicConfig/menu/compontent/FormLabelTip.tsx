import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";

export default function FormLabelTip({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip title={tip}>
        <QuestionCircleOutlined className="cursor-help text-colorTextTertiary" />
      </Tooltip>
    </span>
  );
}
