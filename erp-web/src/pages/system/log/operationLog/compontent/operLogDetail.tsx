import MyDialog from "@/components/BasicDialog";
import { Descriptions, Spin, Table } from "antd";

const jsonBlockClassName =
  "m-0 max-h-[200px] overflow-auto rounded border border-[#f0f0f0] bg-[#fafafa] p-2 text-xs leading-normal break-all whitespace-pre-wrap";

export type ChangeItem = {
  field?: string;
  label?: string;
  before?: unknown;
  after?: unknown;
};

export type OperLogDetailData = {
  operId: number;
  title: string;
  businessType: number;
  method: string;
  requestMethod?: string;
  operName: string;
  operUrl: string;
  operIp: string;
  status: number;
  errorMsg?: string;
  operTime: string;
  costTime: number;
  operParam?: string;
  jsonResult?: string;
  changeDiff?: string | ChangeItem[];
  userAgent?: string;
};

const BUSINESS_TYPE_LABEL: Record<number, string> = {
  0: "其它",
  1: "新增",
  2: "修改",
  3: "删除",
  4: "授权",
  5: "导出",
  6: "导入",
  7: "强退",
  8: "生成代码",
  9: "清空",
};

function formatJsonBlock(raw?: string) {
  if (!raw) return "—";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function parseChangeDiff(changeDiff?: string | ChangeItem[]): ChangeItem[] {
  if (!changeDiff) return [];
  if (Array.isArray(changeDiff)) return changeDiff;
  try {
    const parsed = JSON.parse(changeDiff);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function OperLogDetail(props: {
  open: boolean;
  loading: boolean;
  detail: OperLogDetailData | null;
  onClose: () => void;
}) {
  const { open, loading, detail, onClose } = props;
  const changeItems = parseChangeDiff(detail?.changeDiff);

  return (
    <MyDialog title="操作日志详情" open={open} width={720} footer={null} onCancel={onClose}>
      <Spin spinning={loading}>
        {detail ? (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="日志编号">{detail?.operId}</Descriptions.Item>
              <Descriptions.Item label="模块">{detail?.title}</Descriptions.Item>
              <Descriptions.Item label="业务类型">
                {BUSINESS_TYPE_LABEL[detail?.businessType ?? 0] ?? "其它"}
              </Descriptions.Item>
              <Descriptions.Item label="请求方式">{detail?.requestMethod ?? "—"}</Descriptions.Item>
              <Descriptions.Item label="操作人员">{detail?.operName}</Descriptions.Item>
              <Descriptions.Item label="操作状态">{detail?.status === 0 ? "成功" : "失败"}</Descriptions.Item>
              <Descriptions.Item label="操作时间" span={2}>
                {detail?.operTime}
              </Descriptions.Item>
              <Descriptions.Item label="请求地址" span={2}>
                {detail?.operUrl}
              </Descriptions.Item>
              <Descriptions.Item label="主机地址">{detail?.operIp}</Descriptions.Item>
              <Descriptions.Item label="耗时">{detail?.costTime} ms</Descriptions.Item>
              {detail?.errorMsg ? (
                <Descriptions.Item label="错误信息" span={2}>
                  {detail?.errorMsg}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="User-Agent" span={2}>
                {detail?.userAgent ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="请求参数" span={2}>
                <pre className={jsonBlockClassName}>{formatJsonBlock(detail?.operParam)}</pre>
              </Descriptions.Item>
              <Descriptions.Item label="返回结果" span={2}>
                <pre className={jsonBlockClassName}>{formatJsonBlock(detail?.jsonResult)}</pre>
              </Descriptions.Item>
            </Descriptions>
            {changeItems.length > 0 ? (
              <div className="mt-4">
                <div className="mb-2 text-sm font-medium">修改项</div>
                <Table
                  size="small"
                  pagination={false}
                  rowKey={(row, index) => `${row.field ?? "f"}-${index}`}
                  dataSource={changeItems}
                  columns={[
                    {
                      title: "字段",
                      dataIndex: "label",
                      key: "label",
                      width: 160,
                      render: (_: unknown, row: ChangeItem) => row.label || row.field || "—",
                    },
                    {
                      title: "修改前",
                      dataIndex: "before",
                      key: "before",
                      render: (value: unknown) => (
                        <span className="break-all whitespace-pre-wrap">{formatCellValue(value)}</span>
                      ),
                    },
                    {
                      title: "修改后",
                      dataIndex: "after",
                      key: "after",
                      render: (value: unknown) => (
                        <span className="break-all whitespace-pre-wrap">{formatCellValue(value)}</span>
                      ),
                    },
                  ]}
                />
              </div>
            ) : null}
          </>
        ) : (
          !loading && <div className="py-6 text-center text-[#999]">暂无数据</div>
        )}
      </Spin>
    </MyDialog>
  );
}
