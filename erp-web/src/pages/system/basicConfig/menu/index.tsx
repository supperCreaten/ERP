import { PlusOutlined } from "@ant-design/icons";
import SearchBox from "@/components/SearchBox";
import BasicTable, { useBasicTable } from "@/components/BasicTable";
import api from "@/api";
import AntButton from "@/components/BasicButton";
import { Input, Select, Tag } from "antd";
import type { TableColumnProps } from "antd";
import { MenuModalProvider, useMenuModalStore } from "./compontent/useMenuProvider";
import AddMenu from "./compontent/addMenu";
import type { AnyObject } from "antd/es/_util/type";
import { showMessage } from "@/utils/methods";
import { modal } from "@/utils/static-antd";
import CreateComponent from "@/components/CreateComponent";
import { createIconifyIcon } from "@/icons";
import TableSection from "@/components/TableSection";
import { MENU_TYPE_LABEL } from "./constants";
import { createAuditColumns } from "@/utils/auditColumns";
import TableOperation, { TABLE_LINK_BTN_CLASS } from "@/components/TableOperation";
import { FormConfig } from "@/interface";

function Menu() {
  const { searchRef, onTableReady, onGetParams, onSearch, refreshTable } = useBasicTable();
  const { state, dispatch } = useMenuModalStore();
  const formConfig: FormConfig[] = [
    {
      formItemProps: { label: "菜单名称", name: "menuName", type: "text" },
      component: <Input placeholder="请输入菜单名称" allowClear />,
    },
    {
      formItemProps: { label: "状态", name: "status", },
      component: (
        <Select placeholder="菜单状态" allowClear>
          <Select.Option value={0}>正常</Select.Option>
          <Select.Option value={1}>停用</Select.Option>
        </Select>
      ),
    },
  ];

  const columns: TableColumnProps[] = [
    {
      title: "菜单名称",
      key: "menuName",
      width: 150,
      ellipsis: true,
      render: (record) => record?.menuName,
    },
    {
      title: "图标",
      key: "icon",
      width: 72,
      align: "center",
      render: (record) => {
        const icon = record?.icon ?? record?.meta?.icon;
        return icon ? CreateComponent(createIconifyIcon(`svg:${icon}`)) : null;
      },
    },
    {
      title: "排序",
      dataIndex: "orderNum",
      key: "orderNum",
      width: 72,
      align: "center",
    },
    {
      title: "权限标识",
      dataIndex: "perms",
      key: "perms",
      width: 140,
      ellipsis: true,
      align: "center",
      render: (text: string) => text || "—",
    },
    {
      title: "类型",
      dataIndex: "menuType",
      key: "menuType",
      width: 88,
      align: "center",
      render: (menuType: number) => MENU_TYPE_LABEL[`${menuType}`] ?? "—",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 88,
      align: "center",
      render: (status: number) => (status === 0 ? <Tag color="processing">正常</Tag> : <Tag color="default">停用</Tag>),
    },
    ...createAuditColumns(),
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_text, record: AnyObject) => (
        <TableOperation size={8}>
          <AntButton
            type="link"
            size="small"
            className={TABLE_LINK_BTN_CLASS}
            onClick={() => {
              dispatch({
                type: "OPEN_MENU",
                visible: true,
                title: "修改菜单",
                menuId: record?.menuId,
              });
            }}
          >
            修改
          </AntButton>
          <AntButton
            type="link"
            size="small"
            className={TABLE_LINK_BTN_CLASS}
            onClick={() => {
              dispatch({
                type: "OPEN_MENU",
                visible: true,
                title: "新增菜单",
                menuId: record?.menuId,
              });
            }}
          >
            新增
          </AntButton>
          <AntButton type="link" size="small" className={TABLE_LINK_BTN_CLASS} danger onClick={() => handleDelete(record)}>
            删除
          </AntButton>
        </TableOperation>
      ),
    },
  ];

  const handleDelete = (record: AnyObject) => {
    modal.confirm({
      title: "提示",
      content: `是否确认删除名称为「${record.menuName}」的数据项？`,
      onOk: async () => {
        try {
          await api.deleteMenu({ menuId: record?.menuId });
          showMessage("删除成功", "success");
          refreshTable();
        } catch {
          /* 请求层已提示 */
        }
      },
    });
  };

  return (
    <TableSection>
      <TableSection.Header>
        <SearchBox formConfig={formConfig} ref={searchRef} onSearch={onSearch} />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable
          key="menu-expanded"
          columns={columns}
          onTableReady={onTableReady}
          callback={api.getMenus}
          rowKey="menuId"
          otherTableProps={{
            scroll: { x: 1500 },
          }}
          onGetParams={onGetParams}
          isShowPage={false}
        >
          <BasicTable.ToolbarRight>
            <AntButton
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                dispatch({
                  type: "OPEN_MENU",
                  visible: true,
                  title: "新增菜单",
                });
              }}
            >
              新增
            </AntButton>
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {state.visible && (
        <AddMenu
          onClose={(type) => {
            dispatch({ type: "OPEN_MENU", visible: false, title: "" });
            if (type) refreshTable();
          }}
        />
      )}
    </TableSection>
  );
}

export default () => (
  <MenuModalProvider>
    <Menu />
  </MenuModalProvider>
);
