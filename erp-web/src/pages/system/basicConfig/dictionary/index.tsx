import api from "@/api";
import BasicTable from "@/components/BasicTable";
import SearchBox from "@/components/SearchBox";
import TableOperation, { TABLE_LINK_BTN_CLASS } from "@/components/TableOperation";
import TableSection from "@/components/TableSection";
import { createAuditColumns } from "@/utils/auditColumns";
import { showMessage } from "@/utils/methods";
import { Input, Select, Switch, TableColumnProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import modal from "antd/es/modal";
import { useRef } from "react";
import { PermissionProvider, useDictionaryStore } from "./components/useDictionaryProvider";
import BasicButton from "@/components/BasicButton";
import CreateDictionary from "./components/createDictionary";
import { PlusOutlined } from "@ant-design/icons";
import { FormConfig } from "@/interface";
function Dictionary() {
  const searchRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const { state, dispatch } = useDictionaryStore();
  const formConfig: FormConfig[] = [
    {
      formItemProps: {
        label: "字典编码",
        name: "dictCode",
        type: "text",
      },
      component: <Input placeholder="请输入字典编码" allowClear></Input>,
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
    },
    {
      formItemProps: {
        label: "字典名称",
        name: "dictName",
        type: "text",
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
      title: "字典编码",
      dataIndex: "dictCode",
      key: "dictCode",
      align: "center",
      ellipsis: true,
    },
    {
      title: "字典名称",
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
            onClick={() => {
              dispatch({
                type: "OPEN_DICTIONARY",
                visible: true,
                title: "修改字典",
                id: record?.dictId,
              });
            }}
          >
            修改
          </BasicButton>
          <BasicButton className={TABLE_LINK_BTN_CLASS} color="danger" variant="link" onClick={() => handleDelete(record)}>
            删除
          </BasicButton>
        </TableOperation>
      ),
    },
  ];
  const handleDelete = (record: AnyObject) => {
    modal.confirm({
      title: "提示",
      content: "确定要删除吗？",
      onOk: async () => {
        try {
          await api.deleteRole({ roleId: record?.roleId });
          showMessage("删除成功", "success");
          tableRef.current?.getTableData();
        } catch (error) {}
      },
      onCancel: () => {},
    });
  };
  const onGetParams = () => {
    return searchRef.current.getFieldsValue(true);
  };
  return (
    <TableSection>
      <TableSection.Header>
        <SearchBox formConfig={formConfig} ref={searchRef} onSearch={() => tableRef.current?.getTableData()} />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable columns={columns} ref={tableRef} callback={api.getDictPageQuery} otherTableProps={{ rowKey: "dictId", scroll: { x: 1400 } }} onGetParams={onGetParams}>
          <BasicTable.ToolbarRight>
            <BasicButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                dispatch({
                  type: "OPEN_DICTIONARY",
                  visible: true,
                  title: "新增字典",
                  id: "",
                })
              }
            >
              新增字典
            </BasicButton>
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {state.visible && <CreateDictionary visible={state.visible} title={state.title} onOk={() => tableRef.current?.getTableData()}></CreateDictionary>}
    </TableSection>
  );
}
export default () => {
  return (
    <PermissionProvider>
      <Dictionary />
    </PermissionProvider>
  );
};
