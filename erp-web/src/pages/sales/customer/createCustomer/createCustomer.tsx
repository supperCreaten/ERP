import BasicDialog from "@/components/BasicDialog"
import BasicForm from "@/components/BasicForm"
import { FormConfig } from "@/interface"
import useDict from "@/hooks/use-dict"
import { Card, Cascader, Input, Select, Tabs } from "antd"
import type { DefaultOptionType } from "antd/es/select"
import { pcTextArr } from "element-china-area-data"
import { useEffect, useMemo, useState } from "react"
import { flushSync } from "react-dom"
import { useSearchParams } from "react-router-dom"
import { CUSTOMER_DICT_CODE, tabs } from "../constants"
import BillingInfo from "./components/billingInfo"
import BusinessContact from "./components/businessContact"
import api from "@/api"
import { showMessage } from "@/utils/methods"

const filterOption = (input: string, option?: DefaultOptionType) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase())

export default function CreateCustomer(props: {
  openInfo: { open: boolean; customerId: string }
  onClose: () => void
  onSuccess: () => void
}) {
  const { openInfo, onClose, onSuccess } = props
  const [searchParams] = useSearchParams()
  const customerId = searchParams.get("id")
  const [activeKey, setActiveKey] = useState("billingInfo")
  const [submitLoading, setSubmitLoading] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [form] = BasicForm.useForm()
  const [billingInfoForm] = BasicForm.useForm()
  const [businessContactForm] = BasicForm.useForm()
  const dict = useDict([CUSTOMER_DICT_CODE.CREDIT_LEVEL, CUSTOMER_DICT_CODE.CATEGORY])
  const creditLevelOptions = dict[CUSTOMER_DICT_CODE.CREDIT_LEVEL] ?? []
  const categoryOptions = dict[CUSTOMER_DICT_CODE.CATEGORY] ?? []
  const title = customerId ? "修改客户资料" : "创建客户资料"

  const validateTab = (key: string) => {
    if (key === "billingInfo") return billingInfoForm.validateFields()
    return businessContactForm.validateFields()
  }

  const getTabFormValues = (key: string) => {
    if (key === "billingInfo") return billingInfoForm.getFieldsValue(true)
    return businessContactForm.getFieldsValue(true)
  }

  /** 条件渲染下先挂载对应 Tab，再操作表单，避免 useForm 未连接警告 */
  const runWithTabMounted = (key: string, action: () => void) => {
    flushSync(() => setActiveKey(key))
    action()
  }

  const formConfig: FormConfig[] = useMemo(
    () => [
      {
        formItemProps: {
          label: "客户名称",
          name: "customerName",
          rules: [{ required: true, message: "请输入客户名称" }],
          type: "text",
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
        },
        component: <Input placeholder="请输入客户名称" allowClear />,
        colProps: { sm: 24 },
      },
      {
        formItemProps: {
          label: "客户简称",
          name: "shortName",
          rules: [{ required: true, message: "请输入客户简称" }],
          type: "text",
        },
        component: <Input placeholder="请输入客户简称" allowClear />,
        colProps: { sm: 12 },
      },
      {
        formItemProps: {
          label: "省市",
          name: "region",
          rules: [{ required: true, message: "请选择省市" }],
        },
        component: <Cascader options={pcTextArr} placeholder="请选择省市" allowClear />,
        colProps: { sm: 12 },
      },
      {
        formItemProps: {
          label: "信用等级",
          name: "creditLevel",
          rules: [{ required: true, message: "请选择信用等级" }],
        },
        component: (
          <Select
            showSearch
            placeholder="请选择信用等级"
            allowClear
            options={creditLevelOptions}
            filterOption={filterOption}
          />
        ),
        colProps: { sm: 12 },
      },
      {
        formItemProps: {
          label: "客户分类",
          name: "category",
          rules: [{ required: true, message: "请选择客户分类" }],
        },
        component: (
          <Select
            showSearch
            placeholder="请选择客户分类"
            allowClear
            options={categoryOptions}
            filterOption={filterOption}
          />
        ),
        colProps: { sm: 12 },
      },
      {
        formItemProps: {
          label: "公司地址",
          name: "address",
          rules: [{ required: true, message: "请输入公司地址" }],
          type: "text",
          labelCol: { span: 4 },
          wrapperCol: { span: 20 },
        },
        component: <Input.TextArea placeholder="请输入公司地址" allowClear autoSize={{ maxRows: 3, minRows: 2 }} />,
        colProps: { sm: 24 },
      },
    ],
    [creditLevelOptions, categoryOptions],
  )

  const resetForms = () => {
    form.resetFields()
    runWithTabMounted("billingInfo", () => billingInfoForm.resetFields())
    runWithTabMounted("businessContact", () => businessContactForm.resetFields())
    flushSync(() => setActiveKey("billingInfo"))
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }
  const getCustomerDetail = async () => {
    setLoading(true)
    if (!openInfo.customerId) {
      setLoading(false)
      return
    }
    const data = await api.getCustomerDetail(openInfo.customerId).finally(() => setLoading(false))
    form.setFieldsValue(data)
    runWithTabMounted("billingInfo", () => billingInfoForm.setFieldsValue(data))
    runWithTabMounted("businessContact", () => businessContactForm.setFieldsValue(data))
    flushSync(() => setActiveKey("billingInfo"))
  }
  const onSave = async () => {
    const currentKey = activeKey
    const otherKey = currentKey === "billingInfo" ? "businessContact" : "billingInfo"

    try {
      await form.validateFields()
      await validateTab(currentKey)
    } catch {
      // 基础信息或当前 Tab 校验失败，停留在当前页
      return
    }

    let otherValues: Record<string, unknown>
    try {
      // 临时挂载另一 Tab 做真实校验（条件渲染下字段需挂载才能校验）
      flushSync(() => setActiveKey(otherKey))
      await validateTab(otherKey)
      // 切回前先取未挂载侧的值，避免 getFieldsValue 时 Form 未连接
      otherValues = getTabFormValues(otherKey)
      // 另一 Tab 通过：切回原 Tab，界面上相当于没有切换
      flushSync(() => setActiveKey(currentKey))
    } catch {
      // 另一 Tab 不通过：停在该 Tab 展示错误
      return
    }
    const baseInfo = form.getFieldsValue(true)
    const currentValues = getTabFormValues(currentKey)
    const billingInfo = currentKey === "billingInfo" ? currentValues : otherValues
    const businessContact = currentKey === "businessContact" ? currentValues : otherValues
    const payload = { ...baseInfo, ...billingInfo, ...businessContact }
    const params = openInfo.customerId ? { customerId: openInfo.customerId, ...payload } : payload
    const Api = openInfo.customerId ? api.updateCustomer : api.insertCustomer
    setSubmitLoading(true)
    await Api(params).finally(() => {
      setSubmitLoading(false)
    })
    handleClose()
    showMessage(openInfo.customerId ? "更新成功" : "新增成功", "success")
    onSuccess && onSuccess()
  }
  useEffect(() => {
    getCustomerDetail()
  }, [])
  return (
    <BasicDialog
      width={600}
      open={openInfo.open}
      submitLoading={submitLoading}
      loading={loading}
      onCancel={handleClose}
      title={title}
      onOk={onSave}
    >
      <BasicForm formConfig={formConfig} otherFormConfig={{ form }} />
      <Card styles={{ body: { padding: 12 } }}>
        <Tabs activeKey={activeKey} items={tabs} onChange={setActiveKey} />
        {activeKey === "billingInfo" && <BillingInfo form={billingInfoForm} />}
        {activeKey === "businessContact" && <BusinessContact form={businessContactForm} />}
      </Card>
    </BasicDialog>
  )
}
