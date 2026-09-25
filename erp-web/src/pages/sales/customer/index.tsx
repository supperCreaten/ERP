import BasicButton from "@/components/BasicButton"
import AntButton from "@/components/BasicButton"
import BasicTable, { useBasicTable } from "@/components/BasicTable"
import SearchBoxForward from "@/components/SearchBox"
import TableOperation from "@/components/TableOperation"
import TableSection from "@/components/TableSection"
import { FormConfig } from "@/interface"
import { createAuditColumns } from "@/utils/auditColumns"
import { PlusOutlined } from "@ant-design/icons"
import { Input, TableColumnProps } from "antd"
import { AnyObject } from "antd/es/_util/type"
import CreateCustomer from "./createCustomer/createCustomer"
import { useState } from "react"
import api from "@/api"
export default function SalesCustomer() {
  const { searchRef, onTableReady, onSearch, refreshTable } = useBasicTable()
  const [openInfo, setOpenInfo] = useState<{ open: boolean; customerId: string }>({ open: false, customerId: "" })
  const formConfig: FormConfig[] = [
    {
      formItemProps: { label: "客户名称", name: "customerName", type: "text" },
      component: <Input placeholder="请输入客户名称" allowClear />,
    },
    {
      formItemProps: { label: "联系人", name: "contactPerson", type: "text" },
      component: <Input placeholder="请输入联系人" allowClear />,
    },
  ]
  const columns: TableColumnProps[] = [
    {
      title: "序号",
      key: "menuName",
      width: 80,
      align: "center",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "客户名称",
      key: "customerName",
      dataIndex: "customerName",
      width: 150,
      align: "center",
      ellipsis: true,
    },
    {
      title: "客户简称",
      key: "shortName",
      dataIndex: "shortName",
      width: 120,
      align: "center",
      ellipsis: true,
    },
    {
      title: "公司地址",
      key: "address",
      dataIndex: "address",
      width: 150,
      align: "center",
      ellipsis: true,
    },

    {
      title: "联系人",
      key: "contactPerson",
      dataIndex: "contactPerson",
      width: 120,
      align: "center",
      ellipsis: true,
    },
    {
      title: "联系人手机号",
      key: "contactPhone",
      dataIndex: "contactPhone",
      width: 150,
      align: "center",
      ellipsis: true,
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
            onClick={() => {
              setOpenInfo((pre) => ({ ...pre, open: true, customerId: record?.customerId }))
            }}
          >
            修改
          </AntButton>
          <AntButton type="link" size="small" danger>
            删除
          </AntButton>
        </TableOperation>
      ),
    },
  ]
  const onClose = () => {
    setOpenInfo({ open: false, customerId: "" })
  }
  return (
    <TableSection>
      <TableSection.Header>
        <SearchBoxForward formConfig={formConfig} onSearch={onSearch} />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable
          columns={columns}
          rowKey="customerId"
          onGetParams={() => searchRef.current?.getFieldsValue(true)}
          onTableReady={onTableReady}
          callback={api.customerPageQuery}
        >
          <BasicTable.ToolbarRight>
            <BasicButton
              type="primary"
              title="创建客户"
              icon={<PlusOutlined />}
              onClick={() => setOpenInfo({ open: true, customerId: "" })}
            />
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {openInfo.open && <CreateCustomer openInfo={openInfo} onClose={onClose} onSuccess={refreshTable} />}
    </TableSection>
  )
}
