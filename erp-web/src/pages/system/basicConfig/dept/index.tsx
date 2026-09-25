import BasicButton from "@/components/BasicButton";
import BasicTable from "@/components/BasicTable";
import SearchBoxForward from "@/components/SearchBox";
import TableOperation, { TABLE_LINK_BTN_CLASS } from "@/components/TableOperation";
import TableSection from "@/components/TableSection";
import { FormConfig } from "@/interface";
import { createAuditColumns } from "@/utils/auditColumns";
import { Input, Select, TableColumnProps } from "antd";
import { useRef } from "react";

export default function dept() {
  const searchFormRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const formConfig: FormConfig[] = [
    {
      formItemProps: {
        label: "部门名称",
        name: "dictCode",
        type:"text"
      },
      component: <Input placeholder="请输入字典名称" allowClear></Input>,
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
    },
    {
      formItemProps: {
        label: "状态",
        name: "status",
      },
      component: (
        <Select>
          <Select.Option value={0}>启用</Select.Option>
          <Select.Option value={1}>禁用</Select.Option>
        </Select>
      ),
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
    },
  ];
  const columns: TableColumnProps[] = [
    {
      title: "序号",
      align: "center",
      width: 70,
      ellipsis: true,
      render: (text, record, index) => index + 1,
    },
    {
      title: "部门名称",
      dataIndex: "dictName",
      key: "dictName",
      align: "center",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 88,
      align: "center",
      render(value, record, index) {
        if (!value) return "";
        return value === "0" ? "启用" : "禁用";
      },
    },
    {
      title: "备注",
      dataIndex: "roleName",
      key: "roleName",
      align: "center",
      ellipsis: true,
    },
    ...createAuditColumns(),
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: 220,
      fixed: "right",
      align: "center",
      render: (text, record) => (
        <TableOperation>
          <BasicButton
            type="link"
            className={TABLE_LINK_BTN_CLASS}
            // onClick={() => {
            //   dispatch({
            //     type: "OPEN_DICTIONARY",
            //     visible: true,
            //     title: "修改字典",
            //     id: record?.dictId,
            //   });
            // }}
          >
            修改
          </BasicButton>
          <BasicButton className={TABLE_LINK_BTN_CLASS} color="danger" variant="link">
            删除
          </BasicButton>
        </TableOperation>
      ),
    },
  ];
  const onGetParams = () => {
    return searchFormRef.current.getFieldsValue(true);
  };
  return (
    <TableSection>
      <TableSection.Header>
        <SearchBoxForward ref={searchFormRef} formConfig={formConfig} onSearch={() => tableRef.current?.getTableData()} />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable ref={tableRef} columns={columns} rowKey="deptId" callback={() => Promise.resolve([])} onGetParams={onGetParams} isShowPage={false}></BasicTable>
      </TableSection.Content>
    </TableSection>
  );
}
