import { Fragment, forwardRef, type Key, type Ref } from "react"
import { Col, Form, FormInstance, FormProps, Row } from "antd"
import FormSectionBlock from "@/components/FormSectionBlock"
import type { FormConfig, FormSectionConfig } from "@/interface"
import { getValueFromTtim } from "@/utils/methods"
function resolveFieldKey(item: FormConfig, index: number): Key {
  if (item.key) return item.key
  const name = item.formItemProps?.name
  if (Array.isArray(name)) return name.join(".")
  if (name != null) return name
  return index
}

function renderFormFields(formConfig: FormConfig[], gutter: number | [number, number]) {
  const FormItem = Form.Item
  return (
    <Row gutter={gutter}>
      {formConfig.map((item, index) => {
        const itemKey = resolveFieldKey(item, index)
        const { type, ...formItemProps } = item.formItemProps || {}
        if (type === "text") {
          formItemProps.getValueFromEvent = (event) => {
            const data = item.formItemProps?.getValueFromEvent ? item.formItemProps.getValueFromEvent(event) : event
            return getValueFromTtim(data)
          }
        }
        if (item.type === "slot") {
          if (item.colProps) {
            return (
              <Col {...item.colProps} key={itemKey}>
                {item.component}
              </Col>
            )
          }
          return <Fragment key={itemKey}>{item.component}</Fragment>
        }
        return (
          <Col {...item.colProps} key={itemKey}>
            <FormItem {...formItemProps}>{item.component}</FormItem>
          </Col>
        )
      })}
    </Row>
  )
}

const BasicFormInner = forwardRef(function BasicForm(
  props: {
    formConfig?: FormConfig[]
    sections?: FormSectionConfig[]
    children?: React.ReactNode
    otherFormConfig?: FormProps
    gutter?: number | [number, number]
  },
  ref: Ref<FormInstance<any>> | null,
) {
  const { formConfig, sections, children, otherFormConfig = {}, gutter = 5 } = props
  const defaultFormProps: FormProps & { ref: Ref<FormInstance<any>> } = {
    labelCol: { xl: { span: 6 }, xxl: { span: 8 } },
    wrapperCol: { xl: { span: 18 }, xxl: { span: 16 } },
    size: "middle",
    ref,
  }

  return (
    <Form {...defaultFormProps} {...otherFormConfig}>
      {sections?.map((section, sectionIndex) => {
        const sectionGutter = section.gutter ?? gutter
        const sectionContent = (
          <>
            {section.childrenFirst ? section.children : null}
            {section.formConfig?.length ? (
              <div className={section.formConfigClassName}>{renderFormFields(section.formConfig, sectionGutter)}</div>
            ) : null}
            {!section.childrenFirst ? section.children : null}
          </>
        )
        if (!section.title) {
          return <Fragment key={section.title ?? sectionIndex}>{sectionContent}</Fragment>
        }
        return (
          <FormSectionBlock
            key={section.title}
            title={section.title}
            variant={section.variant}
            className={section.className}
          >
            {sectionContent}
          </FormSectionBlock>
        )
      })}
      {formConfig?.length ? renderFormFields(formConfig, gutter) : null}
      {children}
    </Form>
  )
})

type BasicFormType = typeof BasicFormInner & {
  useForm: typeof Form.useForm
  useWatch: typeof Form.useWatch
  Item: typeof Form.Item
  List: typeof Form.List
  ErrorList: typeof Form.ErrorList
  Provider: typeof Form.Provider
}

const BasicForm = BasicFormInner as BasicFormType
BasicForm.useForm = Form.useForm
BasicForm.useWatch = Form.useWatch
BasicForm.Item = Form.Item
BasicForm.List = Form.List
BasicForm.ErrorList = Form.ErrorList
BasicForm.Provider = Form.Provider

export default BasicForm
