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
import { Cascader, Input, Select, TableColumnsType } from "antd"
import CreateCustomer from "./createCustomer/createCustomer"
import { modal } from "@/utils/static-antd"
import api from "@/api"
import { showMessage } from "@/utils/methods"
import { TableRowSelection } from "antd/es/table/interface"
import ImportFile, { type ImportResult } from "@/components/ImportFile"
import useDict from "@/hooks/use-dict"
import { CUSTOMER_DICT_CODE } from "./constants"
import { pcTextArr } from "element-china-area-data"
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
  const { searchRef, onTableReady, onSearch, refreshTable } = useBasicTable<CustomerTableData>()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [openInfo, setOpenInfo] = useState<{ open: boolean; customerId: string }>({ open: false, customerId: "" })
  const [visible, setVisible] = useState<boolean>(false)
  const dict = useDict([CUSTOMER_DICT_CODE.CREDIT_LEVEL, CUSTOMER_DICT_CODE.CATEGORY])
  const creditLevelOptions = dict[CUSTOMER_DICT_CODE.CREDIT_LEVEL] ?? []
  const categoryOptions = dict[CUSTOMER_DICT_CODE.CATEGORY] ?? []
  const formConfig: FormConfig[] = [
    {
      formItemProps: { label: "省市", name: "region", },
      component: <Cascader placeholder="请选择省市" allowClear options={pcTextArr}/>,
    },
    {
      formItemProps: { label: "客户名称", name: "customerName", type: "text" },
      component: <Input placeholder="请输入客户名称" allowClear />,
    },
    {
      formItemProps: { label: "信用等级", name: "creditLevel" },
      component: <Select placeholder="请选择信用等级" allowClear options={creditLevelOptions}/>,
    },
    {
      formItemProps: { label: "客户分类", name: "category" },
      component: <Select placeholder="请选择客户分类" allowClear options={categoryOptions}/>,
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
      title: "信用等级",
      key: "creditLevelText",
      dataIndex: "creditLevelText",
      width: 120,
      align: "center",
      ellipsis: true,
    },
    {
      title: "客户分类",
      key: "categoryText",
      dataIndex: "categoryText",
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
  const downloadBlobFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }
  const handleImport = async (
    file: File,
    options: { partialCommit: boolean; onProgress?: (percent: number) => void },
  ): Promise<ImportResult | void> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("partialCommit", String(options.partialCommit))
    return (await api.importCustomer(formData, {
      onUploadProgress: (event) => {
        if (!event.total) return
        options.onProgress?.(Math.round((event.loaded / event.total) * 100))
      },
    })) as ImportResult | void
  }
  const handleDownloadTemplate = async () => {
    const blob = (await api.downloadCustomerImportTemplate()) as Blob
    downloadBlobFile(blob, "客户导入模板.xlsx")
  }
  const handleExport = async () => {
    const params = searchRef.current?.getFieldsValue(true) || {}
    const blob = (await api.exportCustomer(params)) as Blob
    downloadBlobFile(blob, "客户资料.xlsx")
  }
  return (
    <TableSection>
      <TableSection.Header>
        <SearchBoxForward
          ref={searchRef}
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
              onClick={() => setVisible(true)}
            />
            <BasicButton
              type="primary"
              title="导出"
              color="purple"
              variant="solid"
              icon={<ExportOutlined />}
              onClick={() => void handleExport()}
            />
          </BasicTable.ToolbarRight>
        </BasicTable>
      </TableSection.Content>
      {openInfo.open && <CreateCustomer openInfo={openInfo} onClose={onClose} onSuccess={refreshTable} />}
      {visible && (
        <ImportFile
          open={visible}
          onClose={() => setVisible(false)}
          onImport={handleImport}
          onDownloadTemplate={handleDownloadTemplate}
          onSuccess={refreshTable}
        />
      )}
    </TableSection>
  )
}
