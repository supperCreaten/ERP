import BasicForm from "@/components/BasicForm"
import { FormConfig } from "@/interface"
import { FormInstance, Input } from "antd"
import { useMemo } from "react"

export default function BillingInfo(props: { form: FormInstance }) {
  const { form } = props
  const formConfig: FormConfig[] = useMemo(
    () => [
      {
        formItemProps: {
          label: "开户行",
          name: "bankName",
          rules: [{ required: true, message: "请输入开户行" }],
          type: "text",
        },
        component: <Input placeholder="请输入开户行" allowClear />,
        colProps: { sm: 24 },
      },
      {
        formItemProps: {
          label: "开票地址",
          name: "invoiceAddress",
          rules: [{ required: true, message: "请输入开票地址" }],
          type: "text",
        },
        component: <Input.TextArea placeholder="请输入开票地址" allowClear autoSize={{ maxRows: 3, minRows: 2 }} />,
        colProps: { sm: 24 },
      },
      {
        formItemProps: {
          label: "账号",
          name: "bankAccount",
          rules: [{ required: true, message: "请输入账号" }],
          type: "text",
        },
        component: <Input placeholder="请输入账号" allowClear />,
        colProps: { sm: 24 },
      },
      {
        formItemProps: {
          label: "税号",
          name: "taxNumber",
          rules: [{ required: true, message: "请输入税号" }],
          type: "text",
        },
        component: <Input placeholder="请输入税号" allowClear />,
        colProps: { sm: 24 },
      },
    ],
    [],
  )

  return (
    <BasicForm
      formConfig={formConfig}
      otherFormConfig={{ form, preserve: true, labelCol: { flex: "85px" }, wrapperCol: { flex: 1 } }}
    />
  )
}
