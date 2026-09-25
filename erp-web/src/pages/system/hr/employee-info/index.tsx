import api from "@/api";
import BasicTable, { useBasicTable } from "@/components/BasicTable";
import SearchBoxForward from "@/components/SearchBox";
import TableSection from "@/components/TableSection";
import { showMessage } from "@/utils/methods";
import { DownloadOutlined, EyeFilled, EyeInvisibleFilled, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Input, Select, Tag, type TableColumnsType } from "antd";
import { useCallback, useState } from "react";
import BasicButton from "@/components/BasicButton";
import { useNavigate } from "react-router-dom";
import { FormConfig } from "@/interface";

interface EmployeeTableData {
  userId: string | number;
  nickName: string;
  employeeNo: string;
  userName: string;
  sex: string;
  age: number | string;
  education: string;
  email: string;
  idCard: string;
  phone: string;
  address: string;
  status: string | number;
  createBy: string;
  createTime: string;
  idCardCipher?: string;
  idCardSecretKey?: string;
  idCardPlain?: string;
  idCardVisible?: boolean;
  phoneCipher?: string;
  phoneSecretKey?: string;
  phonePlain?: string;
  phoneVisible?: boolean;
}

type SensitiveField = "idCard" | "phone";

const SENSITIVE_FIELD_MAP = {
  idCard: {
    cipher: "idCardCipher",
    secret: "idCardSecretKey",
    plain: "idCardPlain",
    visible: "idCardVisible",
  },
  phone: {
    cipher: "phoneCipher",
    secret: "phoneSecretKey",
    plain: "phonePlain",
    visible: "phoneVisible",
  },
} as const;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  "0": { label: "启用", color: "processing" },
  "1": { label: "禁用", color: "default" },
};

export default function EmployeeInfo() {
  const { searchRef, onTableReady, onGetParams, onSearch, patchRow } = useBasicTable();
  const [decryptingKeys, setDecryptingKeys] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const toggleSensitive = useCallback(
    async (record: EmployeeTableData, field: SensitiveField) => {
      const userId = record.userId as string | number | undefined;
      if (userId === undefined || userId === null || userId === "") return;

      const keys = SENSITIVE_FIELD_MAP[field];
      const plainKey = keys.plain;
      const visibleKey = keys.visible;

      /** 已解密过：只切换显示/隐藏，不再请求 */
      if (record[plainKey]) {
        patchRow(userId, { [visibleKey]: !record[visibleKey] });
        return;
      }

      const cipherText = record[keys.cipher] as string | undefined;
      const secretKey = record[keys.secret] as string | undefined;
      if (!cipherText || !secretKey) {
        showMessage("暂无可用的解密数据", "warning");
        return;
      }

      const loadingKey = `${userId}:${field}`;
      setDecryptingKeys((prev) => ({ ...prev, [loadingKey]: true }));
      try {
        const plain = await api.decryptSensitive({ cipherText, secretKey });
        if (typeof plain !== "string" || !plain) {
          showMessage("解密失败", "error");
          return;
        }
        /** 明文写入当前行对应字段，后续切换直接读行数据 */
        patchRow(userId, { [plainKey]: plain, [visibleKey]: true });
      } catch {
        /* 请求层已提示 */
      } finally {
        setDecryptingKeys((prev) => {
          const next = { ...prev };
          delete next[loadingKey];
          return next;
        });
      }
    },
    [patchRow],
  );

  const renderSensitiveCell = (value: unknown, record: EmployeeTableData, field: SensitiveField) => {
    const keys = SENSITIVE_FIELD_MAP[field];
    const userId = record.userId ?? "";
    const plain = record[keys.plain] as string | undefined;
    const visible = record?.[keys.visible];
    const loading = decryptingKeys?.[`${userId}:${field}`];
    return (
      <span className="inline-flex items-center justify-center gap-2">
        <span>{visible && plain ? plain : ((value as string) ?? "-")}</span>
        <span
          className="cursor-pointer text-[#1677ff] hover:opacity-80"
          onClick={() => {
            if (!loading) void toggleSensitive(record, field);
          }}
        >
          {loading ? <LoadingOutlined /> : visible ? <EyeFilled /> : <EyeInvisibleFilled />}
        </span>
      </span>
    );
  };

  const formConfig: FormConfig[] = [
    {
      formItemProps: { label: "员工姓名", name: "userName", type: "text" },
      component: <Input placeholder="请输入员工姓名" allowClear />,
    },
    {
      formItemProps: { label: "员工工号", name: "employeeNo", type: "text" },
      component: <Input placeholder="请输入员工工号" allowClear />,
    },
    {
      formItemProps: { label: "联系电话", name: "phone", type: "text" },
      component: <Input placeholder="请输入联系电话" allowClear />,
    },
    {
      formItemProps: { label: "学历", name: "education", type: "text" },
      component: <Input placeholder="请输入学历" allowClear />,
    },
    {
      formItemProps: { label: "状态", name: "status" },
      component: (
        <Select placeholder="账号状态" allowClear>
          <Select.Option value="0">启用</Select.Option>
          <Select.Option value="1">禁用</Select.Option>
        </Select>
      ),
    },
  ];

  const columns: TableColumnsType<EmployeeTableData> = [
    { title: "序号", align: "center", width: 64, fixed: "left", render: (_, _record, index) => index + 1 },
    { title: "员工姓名", dataIndex: "nickName", align: "center", width: 100, fixed: "left", ellipsis: true },
    { title: "员工工号", dataIndex: "employeeNo", align: "center", width: 110, ellipsis: true },
    { title: "账号", dataIndex: "userName", align: "center", width: 120, ellipsis: true },
    { title: "性别", dataIndex: "sex", width: 72, align: "center" },
    { title: "年龄", dataIndex: "age", width: 72, align: "center" },
    { title: "学历", dataIndex: "education", align: "center", width: 90 },
    { title: "邮箱", dataIndex: "email", align: "center", width: 180, ellipsis: true },
    {
      title: "身份证号",
      dataIndex: "idCard",
      align: "center",
      width: 220,
      render: (value, record) => renderSensitiveCell(value, record, "idCard"),
    },
    {
      title: "联系电话",
      dataIndex: "phone",
      align: "center",
      width: 150,
      render: (value, record) => renderSensitiveCell(value, record, "phone"),
    },
    { title: "现住地址", dataIndex: "address", align: "center", width: 200, ellipsis: true },
    {
      title: "状态",
      dataIndex: "status",
      align: "center",
      width: 88,
      render: (status: string | number) => {
        const item = STATUS_MAP[String(status)] ?? { label: "-", color: "default" };
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    { title: "创建人", dataIndex: "createBy", align: "center", width: 100, ellipsis: true },
    { title: "创建时间", dataIndex: "createTime", align: "center", width: 170, ellipsis: true },
  ];

  return (
    <TableSection>
      <TableSection.Header>
        <SearchBoxForward ref={searchRef} formConfig={formConfig} onSearch={onSearch} />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable<EmployeeTableData> rowKey="userId" onGetParams={onGetParams} onTableReady={onTableReady} columns={columns} callback={api.getUserList} otherTableProps={{ scroll: { x: 1800 } }}>
          <BasicTable.ToolbarRight>
            <BasicButton
              color="primary"
              variant="solid"
              icon={<PlusOutlined />}
              onClick={() => {
                navigate("/system/hr/employee-info/create");
              }}
            >
              新建员工
            </BasicButton>
            <BasicButton color="pink" variant="solid" icon={<DownloadOutlined />}>
              导出
            </BasicButton>
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
    </TableSection>
  );
}
