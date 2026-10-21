import { useState } from "react"
import BasicButton from "@/components/BasicButton"
import AntButton from "@/components/BasicButton"
import BasicTable, { useBasicTable } from "@/components/BasicTable"
import SearchBoxForward from "@/components/SearchBox"
import TableOperation from "@/components/TableOperation"
import TableSection from "@/components/TableSection"
import { FormConfig } from "@/interface"
import { createAuditColumns } from "@/utils/auditColumns"
import { ExportOutlined, PlusOutlined } from "@ant-design/icons"
import { DatePicker, Input, Select, TableColumnsType } from "antd"
import api from "@/api"
import { TableRowSelection } from "antd/es/table/interface"
import useDict from "@/hooks/use-dict"
import { BILL_STATUS_LABEL, BILL_STATUS_OPTIONS, SALES_ORDER_DICT_CODE } from "./constants"
import { useNavigate } from "react-router-dom"
interface SalesOrderTableData {
  orderId: string
  orderNo: string
  billDate: string
  billStatus: string
  customerName: string
  salesPerson: string
  salesType: string
  salesTypeText: string
  deliveryDate: string
  contractNo: string
  createTime: string
  createBy: string
  updateTime: string
  updateBy: string
}
export default function SalesOrder() {
  const { searchRef, onTableReady, onSearch } = useBasicTable()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const navigate = useNavigate()
  const dict = useDict([SALES_ORDER_DICT_CODE.SALES_TYPE])
  const salesTypeList = dict[SALES_ORDER_DICT_CODE.SALES_TYPE] || []
  const formConfig: FormConfig[] = [
    {
      formItemProps: { label: "订单号", name: "orderNo", type: "text" },
      component: <Input placeholder="请输入订单号" allowClear />,
    },
    {
      formItemProps: { label: "客户名称", name: "customerName", type: "text" },
      component: <Input placeholder="请输入客户名称" allowClear />,
    },
    {
      formItemProps: { label: "销售人员", name: "salesPerson", type: "text" },
      component: <Input placeholder="请输入销售人员" allowClear />,
    },
    {
      formItemProps: { label: "销售类型", name: "salesType" },
      component: <Select placeholder="请选择销售类型" allowClear options={salesTypeList} />,
    },
    {
      formItemProps: { label: "单据状态", name: "billStatus" },
      component: <Select placeholder="请选择单据状态" allowClear options={BILL_STATUS_OPTIONS} />,
    },
    {
      formItemProps: { label: "单据日期", name: "billDate" },
      component: <DatePicker className="w-full" allowClear />,
    },
  ]
  const columns: TableColumnsType<SalesOrderTableData> = [
    {
      title: "序号",
      key: "index",
      width: 80,
      align: "center",
      render: (_text, _record, index) => index + 1,
    },
    {
      title: "订单号",
      key: "orderNo",
      dataIndex: "orderNo",
      width: 150,
      align: "center",
      ellipsis: true,
    },
    {
      title: "单据日期",
      key: "billDate",
      dataIndex: "billDate",
      width: 120,
      align: "center",
      ellipsis: true,
    },
    {
      title: "单据状态",
      key: "billStatus",
      dataIndex: "billStatus",
      width: 100,
      align: "center",
      ellipsis: true,
      render: (value: string) => BILL_STATUS_LABEL[value] || value,
    },
    {
      title: "客户名称",
      key: "customerName",
      dataIndex: "customerName",
      width: 180,
      align: "center",
      ellipsis: true,
    },
    {
      title: "销售人员",
      key: "salesPerson",
      dataIndex: "salesPerson",
      width: 120,
      align: "center",
      ellipsis: true,
    },
    {
      title: "销售类型",
      key: "salesTypeText",
      dataIndex: "salesTypeText",
      width: 120,
      align: "center",
      ellipsis: true,
    },
    {
      title: "交货日期",
      key: "deliveryDate",
      dataIndex: "deliveryDate",
      width: 120,
      align: "center",
      ellipsis: true,
    },
    {
      title: "合同号",
      key: "contractNo",
      dataIndex: "contractNo",
      width: 140,
      align: "center",
      ellipsis: true,
    },
    ...createAuditColumns<SalesOrderTableData>(),
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: 120,
      fixed: "right",
      align: "center",
      render: (_text, _record: SalesOrderTableData) => (
        <TableOperation size={8}>
          <AntButton type="link" size="small" onClick={() => {}}>
            修改
          </AntButton>
        </TableOperation>
      ),
    },
  ]
  const rowSelection: TableRowSelection<SalesOrderTableData> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }
  const downloadBlobFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
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
        <BasicTable<SalesOrderTableData>
          columns={columns}
          rowKey="orderId"
          onGetParams={() => searchRef.current?.getFieldsValue(true)}
          onTableReady={onTableReady}
          callback={api.customerPageQuery}
          rowSelection={rowSelection}
        >
          <BasicTable.ToolbarRight>
            <BasicButton
              type="primary"
              title="创建订单"
              icon={<PlusOutlined />}
              onClick={() => {
                navigate("/sales/sales-order/createSalesOrder")
              }}
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
    </TableSection>
  )
}
