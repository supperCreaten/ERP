import { PlusOutlined } from "@ant-design/icons";
import { useRef } from "react";
import SearchBox from "@/components/SearchBox";
import BasicTable from "@/components/BasicTable";
import api from "@/api";
import AntButton from "@/components/BasicButton";
import { Input, Select, Switch, TableColumnProps } from "antd";
import { PermissionProvider, useRoleStore } from "./compontent/useRoleProvider";
import AuthConfig from "./compontent/authConfig";
import AddRole from "./compontent/addRole";
import { AnyObject } from "antd/es/_util/type";
import { showMessage } from "@/utils/methods";
import { modal } from "@/utils/static-antd";
import TableSection from "@/components/TableSection";
import { createAuditColumns } from "@/utils/auditColumns";
import TableOperation, { TABLE_LINK_BTN_CLASS } from "@/components/TableOperation";
import { FormConfig } from "@/interface";
function Role() {
  const searchRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const { state, dispatch } = useRoleStore();
  const formConfig: FormConfig[] = [
    {
      formItemProps: {
        label: "角色编码",
        name: "roleKey",
        type: "text",
      },
      component: <Input></Input>,
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
    },
    {
      formItemProps: {
        label: "角色名称",
        name: "roleName",
        type: "text",
      },
      component: <Input></Input>,
      colProps: { xl: 8, lg: 12, md: 24, sm: 24, xs: 24 },
    },
    {
      formItemProps: {
        label: "角色状态",
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
      ellipsis: true,
      render: (text, record, index) => index + 1,
    },
    {
      title: "角色编码",
      dataIndex: "roleKey",
      key: "roleKey",
      align: "center",
      ellipsis: true,
    },
    {
      title: "角色名称",
      dataIndex: "roleName",
      key: "roleName",

      align: "center",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 88,
      align: "center",
      render: (text, record) => {
        return (
          <Switch
            checked={text === 0 || text === "0"}
            onChange={async (value) => {
              try {
                await api.updateRoleStatus({ roleId: record?.roleId, status: value ? 0 : 1 });
                showMessage("修改状态成功", "success");
                tableRef.current?.getTableData();
              } catch (error) {}
            }}
          />
        );
      },
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
          <AntButton
            type="link"
            className={TABLE_LINK_BTN_CLASS}
            onClick={() => {
              dispatch({
                type: "OPEN_ROLE",
                visible: true,
                title: "修改角色",
                roleId: record?.roleId,
              });
            }}
          >
            修改
          </AntButton>
          <AntButton type="link" className={TABLE_LINK_BTN_CLASS} onClick={() => handleAuthConfig(record)}>
            分配用户
          </AntButton>
          <AntButton type="link" className={TABLE_LINK_BTN_CLASS} onClick={() => handleDelete(record)}>
            删除
          </AntButton>
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
  const handleAuthConfig = (record: AnyObject) => {
    dispatch({
      type: "PERMISSION",
      permissionVisible: true,
      roleId: record?.roleId,
      roleName: record?.roleName,
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
        <BasicTable columns={columns} ref={tableRef} callback={api.getRoleList} otherTableProps={{ rowKey: "roleId", scroll: { x: 1400 } }} onGetParams={onGetParams}>
          <BasicTable.ToolbarRight>
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                dispatch({
                  type: "OPEN_ROLE",
                  visible: true,
                  title: "新增角色",
                });
              }}
            >
              新增
            </AntButton>
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {state.permissionVisible && (
        <AuthConfig
          onClose={() => {
            dispatch({ type: "PERMISSION", permissionVisible: false });
            dispatch({ type: "SET_SELECTED_USER_KEYS", selectedUserKeys: [] });
          }}
        />
      )}
      {state.visible && (
        <AddRole
          onClose={(type) => {
            dispatch({ type: "OPEN_ROLE", visible: false, title: "" });
            if (!type) return;
            tableRef.current?.getTableData();
          }}
        />
      )}
    </TableSection>
  );
}
export default () => {
  return (
    <PermissionProvider>
      <Role />
    </PermissionProvider>
  );
};
