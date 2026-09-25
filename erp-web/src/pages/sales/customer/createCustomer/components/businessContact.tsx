import BasicForm from "@/components/BasicForm"
import { FormConfig } from "@/interface"
import { FormInstance, Input } from "antd"
import { useMemo } from "react"

export default function BusinessContact(props: { form: FormInstance }) {
  const { form } = props
  const formConfig: FormConfig[] = useMemo(
    () => [
      {
        formItemProps: {
          label: "联系人",
          name: "contactPerson",
          rules: [{ required: true, message: "请输入联系人" }],
          type: "text",
        },
        component: <Input placeholder="请输入联系人" allowClear />,
        colProps: { sm: 24 },
      },
      {
        formItemProps: {
          label: "联系人电话",
          name: "contactPhone",
          rules: [
            { required: true, message: "请输入联系人电话" },
            { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的联系人电话" },
          ],
          type: "text",
        },
        component: <Input placeholder="请输入联系人电话" allowClear maxLength={11} showCount />,
        colProps: { sm: 24 },
      },
    ],
    [],
  )

  return (
    <BasicForm
      formConfig={formConfig}
      otherFormConfig={{ form, preserve: true, labelCol: { flex: "90px" }, wrapperCol: { flex: 1 } }}
    />
  )
}
