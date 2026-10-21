import { useMemo, useRef } from "react"
import BasicButton from "@/components/BasicButton"
import BasicForm from "@/components/BasicForm"
import BasicTable, { type BasicTableHandle } from "@/components/BasicTable"
import ContentSection from "@/components/ContentSection"
import LayoutTitle from "@/components/LayoutTitle"
import TableOperation from "@/components/TableOperation"
import { FormConfig } from "@/interface"
import useDict from "@/hooks/use-dict"
import { DatePicker, Input, Select, type TableColumnsType } from "antd"
import {
  CURRENCY_OPTIONS,
  SALES_ORDER_DICT_CODE,
  TAX_INCLUDED_OPTIONS,
  TAX_RATE_OPTIONS,
} from "../constants"
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { formartDecimalPlaces, trimTrailingZeros } from "@/utils/format"
import { calcTaxInclusivePriceFields } from "@/utils/calc-tax-price"
import { showMessage } from "@/utils/methods"
import dayjs from "dayjs"
import NP from "number-precision"

/** 明细行字段；价格类由含税单价 + 数量 + 税率推导 */
interface SalesOrderItem {
  id: string
  materialCode?: string
  materialName?: string
  spec?: string
  unit?: string
  quantity?: string
  /** 含税单价 */
  taxInclusiveUnitPrice?: string
  /** 含税金额 */
  taxInclusiveAmount?: string
  /** 税率(%) */
  taxRate?: string
  /** 不含税单价 */
  unitPrice?: string
  /** 不含税金额 */
  amount?: string
  /** 税额 */
  taxAmount?: string
  qualityReq?: string
  packageReq?: string
  remark?: string
}

function canCalcPrice(row: Pick<SalesOrderItem, "quantity" | "taxInclusiveUnitPrice" | "taxRate">) {
  return (
    row.quantity != null &&
    row.quantity !== "" &&
    row.taxInclusiveUnitPrice != null &&
    row.taxInclusiveUnitPrice !== "" &&
    row.taxRate != null &&
    row.taxRate !== ""
  )
}

function recalcRow(
  row: Pick<SalesOrderItem, "quantity" | "taxInclusiveUnitPrice" | "taxRate">,
): Partial<SalesOrderItem> {
  if (!canCalcPrice(row)) {
    return {
      taxInclusiveAmount: undefined,
      unitPrice: undefined,
      amount: undefined,
      taxAmount: undefined,
    }
  }
  const result = calcTaxInclusivePriceFields(row.taxInclusiveUnitPrice, row.quantity, row.taxRate)
  return {
    taxInclusiveUnitPrice: result.taxInclusiveUnitPrice,
    quantity: result.quantity,
    taxInclusiveAmount: result.taxInclusiveAmount,
    unitPrice: result.unitPrice,
    amount: result.amount,
    taxAmount: result.taxAmount,
    taxRate: result.taxRate,
  }
}

function validateOrderItems(rows: SalesOrderItem[]): string | null {
  if (!rows.length) return "请至少添加一行明细"
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const line = i + 1
    if (!row.materialName) return `第 ${line} 行：请选择物料`
    if (row.quantity == null || row.quantity === "") return `第 ${line} 行：请输入数量`
    if (Number(row.quantity) <= 0) return `第 ${line} 行：数量须大于 0`
    if (row.taxInclusiveUnitPrice == null || row.taxInclusiveUnitPrice === "") {
      return `第 ${line} 行：请输入含税单价`
    }
    if (Number(row.taxInclusiveUnitPrice) < 0) return `第 ${line} 行：含税单价不能为负数`
    if (row.taxRate == null || row.taxRate === "") return `第 ${line} 行：请选择税率`
  }
  return null
}

export default function salesOrderFormWizard(props: { mode: "create" | "update" }) {
  const { mode } = props
  const [form] = BasicForm.useForm()
  const tableRef = useRef<BasicTableHandle<SalesOrderItem>>(null)
  const dict = useDict([SALES_ORDER_DICT_CODE.SALES_TYPE])
  const salesTypeOptions = dict[SALES_ORDER_DICT_CODE.SALES_TYPE] || []

  const syncHeaderTotals = (rows?: SalesOrderItem[]) => {
    const list = rows ?? tableRef.current?.getTableRecords?.() ?? []
    let totalAmount = 0
    let hasAmount = false
    for (const row of list) {
      if (row.taxInclusiveAmount == null || row.taxInclusiveAmount === "") continue
      totalAmount = NP.plus(totalAmount, row.taxInclusiveAmount)
      hasAmount = true
    }
    form.setFieldsValue({
      totalAmount: hasAmount ? trimTrailingZeros(NP.round(totalAmount, 4).toFixed(4)) : undefined,
    })
  }

  const patchItem = (id: string, patch: Partial<SalesOrderItem>, recalc = false) => {
    const nextPatch = { ...patch }
    if (recalc) {
      const rows = tableRef.current?.getTableRecords?.() ?? []
      const current = rows.find((row) => row.id === id)
      Object.assign(
        nextPatch,
        recalcRow({
          quantity: nextPatch.quantity ?? current?.quantity,
          taxInclusiveUnitPrice: nextPatch.taxInclusiveUnitPrice ?? current?.taxInclusiveUnitPrice,
          taxRate: nextPatch.taxRate ?? current?.taxRate,
        }),
      )
    }
    tableRef.current?.patchRow?.(id, nextPatch)
    queueMicrotask(() => syncHeaderTotals())
  }

  const baseFormInfo = useMemo<FormConfig[]>(() => {
    const systemFields: FormConfig[] = [
      {
        formItemProps: { label: "订单号", name: "orderNo" },
        component: <Input disabled placeholder="系统自动生成" />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: { label: "单据状态", name: "billStatus" },
        component: <Input disabled />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: { label: "制单人", name: "operator" },
        component: <Input disabled placeholder="当前登录人" />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
    ]

    const auditFields: FormConfig[] =
      mode === "update"
        ? [
            {
              formItemProps: { label: "审核人", name: "auditor" },
              component: <Input disabled placeholder="审核后生成" />,
              colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
            },
            {
              formItemProps: { label: "审核日期", name: "auditDate" },
              component: <DatePicker disabled className="w-full" placeholder="审核后生成" />,
              colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
            },
          ]
        : []

    const businessFields: FormConfig[] = [
      {
        formItemProps: {
          label: "单据日期",
          name: "billDate",
          rules: [{ required: true, message: "请选择单据日期" }],
        },
        component: <DatePicker placeholder="请选择单据日期" allowClear className="w-full" />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "客户",
          name: "customerId",
          rules: [{ required: true, message: "请选择客户" }],
        },
        component: <Select placeholder="请选择客户" allowClear showSearch optionFilterProp="label" />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "销售人员",
          name: "salesPerson",
          rules: [{ required: true, message: "请选择销售人员" }],
        },
        component: <Select placeholder="请选择销售人员" allowClear />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "销售类型",
          name: "salesType",
          rules: [{ required: true, message: "请选择销售类型" }],
        },
        component: <Select placeholder="请选择销售类型" allowClear options={salesTypeOptions} />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "交货日期",
          name: "deliveryDate",
          rules: [{ required: true, message: "请选择交货日期" }],
        },
        component: <DatePicker placeholder="请选择交货日期" allowClear className="w-full" />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: { label: "合同号", name: "contractNo" },
        component: <Input placeholder="请输入合同号" allowClear />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: { label: "客户订单号", name: "customerOrderNo" },
        component: <Input placeholder="请输入客户订单号" allowClear />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "联系人",
          name: "contactPerson",
          rules: [{ required: true, message: "请输入联系人" }],
        },
        component: <Input placeholder="请输入联系人" allowClear />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "联系电话",
          name: "contactPhone",
          rules: [{ required: true, message: "请输入联系电话" }],
        },
        component: <Input placeholder="请输入联系电话" allowClear />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "收货人",
          name: "consignee",
          rules: [{ required: true, message: "请输入收货人" }],
        },
        component: <Input placeholder="请输入收货人" allowClear />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "币种",
          name: "currency",
          rules: [{ required: true, message: "请选择币种" }],
        },
        component: <Select placeholder="请选择币种" allowClear options={CURRENCY_OPTIONS} />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "含税标志",
          name: "taxIncluded",
          rules: [{ required: true, message: "请选择含税标志" }],
        },
        component: <Select placeholder="请选择" allowClear options={TAX_INCLUDED_OPTIONS} />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: { label: "金额合计", name: "totalAmount" },
        component: <Input disabled placeholder="由明细含税金额汇总" />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 6, xs: 24 },
      },
      {
        formItemProps: {
          label: "收货地址",
          name: "deliveryAddress",
          rules: [{ required: true, message: "请输入收货地址" }],
        },
        component: <Input placeholder="请输入收货地址" allowClear />,
        colProps: { lg: 12, md: 24, sm: 24, xl: 12, xs: 24 },
      },
      {
        formItemProps: { label: "备注", name: "remark" },
        component: <Input.TextArea placeholder="请输入备注" allowClear rows={1} />,
        colProps: { lg: 24, md: 24, sm: 24, xl: 12, xs: 24 },
      },
    ]

    return [...systemFields, ...businessFields, ...auditFields]
  }, [mode, salesTypeOptions])

  /** 与下方各列 width 之和一致 */
  const ORDER_ITEM_TABLE_WIDTH = 2006

  const columns: TableColumnsType<SalesOrderItem> = useMemo(
    () =>
      (
        [
          {
            title: "序号",
            key: "index",
            width: 56,
            fixed: "left",
            render: (_text, _record, index) => index + 1,
          },
          {
            title: "物料名称",
            dataIndex: "materialName",
            key: "materialName",
            width: 180,
            render: (text, record) => (
              <Select
                value={text}
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="请选择物料"
                options={[]}
                className="w-full"
                onChange={(value, option) => {
                  if (!value) {
                    patchItem(record.id, {
                      materialName: undefined,
                      materialCode: undefined,
                      spec: undefined,
                      unit: undefined,
                    })
                    return
                  }
                  const selected = Array.isArray(option) ? option[0] : option
                  const meta = (selected as { materialCode?: string; spec?: string; unit?: string } | undefined) ?? {}
                  patchItem(record.id, {
                    materialName: value,
                    materialCode: meta.materialCode,
                    spec: meta.spec,
                    unit: meta.unit,
                  })
                }}
              />
            ),
          },
          {
            title: "物料编码",
            dataIndex: "materialCode",
            key: "materialCode",
            width: 130,
            ellipsis: true,
          },
          {
            title: "型号规格",
            dataIndex: "spec",
            key: "spec",
            width: 140,
            ellipsis: true,
          },
          {
            title: "计量单位",
            dataIndex: "unit",
            key: "unit",
            width: 90,
            ellipsis: true,
          },
          {
            title: "数量",
            dataIndex: "quantity",
            key: "quantity",
            width: 120,
            render: (text, record) => (
              <Input
                value={text}
                allowClear
                placeholder="数量"
                onChange={(e) => {
                  patchItem(record.id, { quantity: formartDecimalPlaces(e.target.value, 2) }, true)
                }}
                onBlur={(e) => {
                  patchItem(record.id, { quantity: trimTrailingZeros(e.target.value) }, true)
                }}
              />
            ),
          },
          {
            title: "含税单价",
            dataIndex: "taxInclusiveUnitPrice",
            key: "taxInclusiveUnitPrice",
            width: 130,
            render: (text, record) => (
              <Input
                value={text}
                allowClear
                placeholder="含税单价"
                onChange={(e) => {
                  patchItem(record.id, { taxInclusiveUnitPrice: formartDecimalPlaces(e.target.value, 2) }, true)
                }}
                onBlur={(e) => {
                  patchItem(record.id, { taxInclusiveUnitPrice: trimTrailingZeros(e.target.value) }, true)
                }}
              />
            ),
          },
          {
            title: "含税金额",
            dataIndex: "taxInclusiveAmount",
            key: "taxInclusiveAmount",
            width: 130,
          },
          {
            title: (
              <span>
                <span className="text-[#ff4d4f]">*</span> 税率(%)
              </span>
            ),
            dataIndex: "taxRate",
            key: "taxRate",
            width: 120,
            render: (text, record) => (
              <Select
                value={text === undefined || text === "" ? undefined : String(text)}
                allowClear
                placeholder="请选择税率"
                options={TAX_RATE_OPTIONS}
                className="w-full"
                onChange={(value) => {
                  patchItem(record.id, { taxRate: value }, true)
                }}
              />
            ),
          },
          {
            title: "不含税单价",
            dataIndex: "unitPrice",
            key: "unitPrice",
            width: 130,
          },
          {
            title: "不含税金额",
            dataIndex: "amount",
            key: "amount",
            width: 130,
          },
          {
            title: "税额",
            dataIndex: "taxAmount",
            key: "taxAmount",
            width: 120,
          },
          {
            title: "质量要求",
            dataIndex: "qualityReq",
            key: "qualityReq",
            width: 150,
            render: (text, record) => (
              <Input
                value={text}
                allowClear
                placeholder="质量要求"
                onChange={(e) => patchItem(record.id, { qualityReq: e.target.value })}
              />
            ),
          },
          {
            title: "包装要求",
            dataIndex: "packageReq",
            key: "packageReq",
            width: 150,
            render: (text, record) => (
              <Input
                value={text}
                allowClear
                placeholder="包装要求"
                onChange={(e) => patchItem(record.id, { packageReq: e.target.value })}
              />
            ),
          },
          {
            title: "备注",
            dataIndex: "remark",
            key: "remark",
            width: 160,
            render: (text, record) => (
              <Input
                value={text}
                allowClear
                placeholder="备注"
                onChange={(e) => patchItem(record.id, { remark: e.target.value })}
              />
            ),
          },
          {
            title: "操作",
            key: "action",
            width: 80,
            fixed: "right",
            render: (_text, record) => (
              <BasicButton
                type="link"
                danger
                title="删除"
                icon={<DeleteOutlined />}
                onClick={() => {
                  const rows = (tableRef.current?.getTableRecords?.() ?? []).filter((row) => row.id !== record.id)
                  tableRef.current?.setTableData(rows)
                  syncHeaderTotals(rows)
                }}
              />
            ),
          },
        ] as TableColumnsType<SalesOrderItem>
      ).map((col) => ({ ...col, align: "center" as const })),
    [],
  )

  const onSubmit = async () => {
    try {
      const baseValues = await form.validateFields()
      const deliveryDate = baseValues.deliveryDate
        ? dayjs(baseValues.deliveryDate as dayjs.ConfigType).format("YYYY-MM-DD")
        : undefined
      const rows = (tableRef.current?.getTableRecords?.() ?? []).map((row, index) => {
        const money = canCalcPrice(row) ? recalcRow(row) : {}
        return {
          ...row,
          ...money,
          lineNo: String(index + 1),
          deliveryDate,
        }
      })
      const itemError = validateOrderItems(rows)
      if (itemError) {
        showMessage(itemError, "warning")
        return
      }
      console.log({ ...baseValues, items: rows })
    } catch {
      // 表头校验失败，Form.Item 已标红
    }
  }

  return (
    <ContentSection isContentFullCard={false}>
      <ContentSection.Content>
        <LayoutTitle title="销售订单">
          <BasicForm
            formConfig={baseFormInfo}
            otherFormConfig={{
              form,
              labelCol: { flex: "90px" },
              wrapperCol: { flex: 1 },
            }}
          />
        </LayoutTitle>
        <LayoutTitle title="订单明细">
          <div>
            <div className="mb-2">
              <BasicButton
                title="添加行"
                icon={<PlusOutlined />}
                onClick={() => {
                  tableRef.current?.addTableRow({
                    id: crypto.randomUUID(),
                    materialCode: undefined,
                    materialName: undefined,
                    spec: undefined,
                    unit: undefined,
                    quantity: undefined,
                    taxInclusiveUnitPrice: undefined,
                    taxInclusiveAmount: undefined,
                    taxRate: undefined,
                    unitPrice: undefined,
                    amount: undefined,
                    taxAmount: undefined,
                    qualityReq: undefined,
                    packageReq: undefined,
                    remark: undefined,
                  })
                }}
              />
            </div>
            <BasicTable<SalesOrderItem>
              ref={tableRef}
              columns={columns}
              rowKey="id"
              isAutoResize={false}
              isRequest={false}
              isShowPage={false}
              otherTableProps={{ scroll: { x: ORDER_ITEM_TABLE_WIDTH } }}
            />
          </div>
        </LayoutTitle>
      </ContentSection.Content>
      <ContentSection.Footer>
        <TableOperation>
          <BasicButton title="关闭" />
          <BasicButton type="primary" title="提交" onClick={onSubmit} />
        </TableOperation>
      </ContentSection.Footer>
    </ContentSection>
  )
}
