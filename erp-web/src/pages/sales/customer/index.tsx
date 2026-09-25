import { useState } from "react"
import BasicButton from "@/components/BasicButton"
import AntButton from "@/components/BasicButton"
import BasicTable, { useBasicTable } from "@/components/BasicTable"
import SearchBoxForward from "@/components/SearchBox"
import TableOperation from "@/components/TableOperation"
import TableSection from "@/components/TableSection"
import { FormConfig } from "@/interface"
import { createAuditColumns } from "@/utils/auditColumns"
import { DeleteFilled, ExportOutlined, ImportOutlined, PlusOutlined } from "@ant-design/icons"
import { Input, TableColumnsType } from "antd"
import CreateCustomer from "./createCustomer/createCustomer"
import { modal } from "@/utils/static-antd"
import api from "@/api"
import { showMessage } from "@/utils/methods"
import { TableRowSelection } from "antd/es/table/interface"
interface CustomerTableData {
  customerId: string
  customerName: string
  shortName: string
  address: string
  contactPerson: string
  contactPhone: string
  createTime: string
  createBy: string
  updateTime: string
  updateBy: string
  status: number
}
export default function SalesCustomer() {
  const { searchRef, onTableReady, onSearch, refreshTable } = useBasicTable()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
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
  const columns: TableColumnsType<CustomerTableData> = [
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
    ...createAuditColumns<CustomerTableData>(),
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_text, record: CustomerTableData) => (
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
          <AntButton
            type="link"
            size="small"
            danger
            onClick={() => {
              modal.confirm({
                type: "warning",
                title: "删除",
                content: "确定要删除吗？",
                onOk: () => handleDelete([record?.customerId]),
              })
            }}
          >
            删除
          </AntButton>
        </TableOperation>
      ),
    },
  ]
  const rowSelection: TableRowSelection<CustomerTableData> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }
  const handleDelete = async (ids: string[]) => {
    modal.confirm({
      title: "删除",
      content: "确定删除选择的客户吗？",
      onOk: async () => {
        await api.deleteCustomer(ids)
        showMessage("删除成功", "success")
        refreshTable()
        setSelectedRowKeys([])
      },
    })
  }
  const onClose = () => {
    setOpenInfo({ open: false, customerId: "" })
  }
  return (
    <TableSection>
      <TableSection.Header>
        <SearchBoxForward
          formConfig={formConfig}
          onSearch={() => {
            setSelectedRowKeys([])
            onSearch()
          }}
        />
      </TableSection.Header>
      <TableSection.Content>
        <BasicTable<CustomerTableData>
          columns={columns}
          rowKey="customerId"
          onGetParams={() => searchRef.current?.getFieldsValue(true)}
          onTableReady={onTableReady}
          callback={api.customerPageQuery}
          rowSelection={rowSelection}
        >
          <BasicTable.ToolbarRight>
            <BasicButton
              type="primary"
              title="创建客户"
              icon={<PlusOutlined />}
              onClick={() => setOpenInfo({ open: true, customerId: "" })}
            />
            <BasicButton
              title="批量删除"
              danger
              icon={<DeleteFilled />}
              onClick={() => {
                if (!selectedRowKeys.length) {
                  showMessage("请勾选数据后重试", "warning")
                  return
                }
                handleDelete(selectedRowKeys as Array<string>)
              }}
            />
            <BasicButton
              title="导入"
              color="orange"
              variant="solid"
              icon={<ImportOutlined />}
            />
            <BasicButton
              type="primary"
              title="导出"
              color="purple"
              variant="solid"
              icon={<ExportOutlined />}
            />
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {openInfo.open && <CreateCustomer openInfo={openInfo} onClose={onClose} onSuccess={refreshTable} />}
    </TableSection>
  )
}
