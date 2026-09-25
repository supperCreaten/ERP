import BasicButton from "@/components/BasicButton"
import BasicDialog from "@/components/BasicDialog"
import BasicForm from "@/components/BasicForm"
import BasicTable from "@/components/BasicTable"
import LayoutTitle from "@/components/LayoutTitle"
import { FormConfig } from "@/interface"
import { Input, Radio, Switch, type TableColumnsType } from "antd"
import { useEffect, useRef } from "react"
import { useDictionaryStore } from "./useDictionaryProvider"
import api from "@/api"
import { showMessage } from "@/utils/methods"

interface DictItemTableData {
  id: string | number
  dictLabel: string
  dictValue: string
  status: string
  remark: string
}

export default function createDictionary(props: { visible: boolean; title: string; onOk: () => void }) {
  const { visible, title, onOk } = props
  const [form] = BasicForm.useForm()
  const tableRef = useRef<any>(null)
  const { state, dispatch } = useDictionaryStore()
  const formConfig: FormConfig[] = [
    {
      formItemProps: {
        label: "字典编码",
        name: "dictCode",
        type: "text",
        rules: [{ required: true, message: "请输入字典编码" }],
      },
      component: <Input placeholder="请输入字典编码" allowClear />,
      colProps: { xl: 24 },
    },
    {
      formItemProps: {
        label: "字典名称",
        name: "dictName",
        type: "text",
        rules: [{ required: true, message: "请输入字典名称" }],
      },
      component: <Input placeholder="请输入字典名称" allowClear />,
      colProps: { xl: 24 },
    },
    {
      formItemProps: {
        label: "状态",
        name: "status",
        rules: [{ required: true, message: "请选择状态" }],
      },
      component: (
        <Radio.Group>
          <Radio value="0">启用</Radio>
          <Radio value="1">停用</Radio>
        </Radio.Group>
      ),
      colProps: { xl: 24 },
    },
  ]
  const columns: TableColumnsType<DictItemTableData> = [
    {
      title: "序号",
      align: "center",
      ellipsis: true,
      width: 70,
      render: (text, record, index) => index + 1,
    },
    {
      title: "数据标签",
      dataIndex: "dictLabel",
      key: "dictLabel",
      align: "center",
      render(value, record, index) {
        return (
          <Input
            value={record.dictLabel}
            onChange={(e) => {
              tableRef.current?.patchRow(record.id, { dictLabel: e.target.value })
            }}
          ></Input>
        )
      },
    },
    {
      title: "数据键值",
      dataIndex: "dictValue",
      key: "dictValue",
      align: "center",
      render(value, record, index) {
        return (
          <Input
            value={record.dictValue}
            onChange={(e) => {
              tableRef.current?.patchRow(record.id, { dictValue: e.target.value })
            }}
          ></Input>
        )
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 70,
      align: "center",
      render(value, record, index) {
        return (
          <Switch
            checked={value === "0"}
            onChange={(checked) => {
              tableRef.current?.patchRow(record.id, { status: checked ? "0" : "1" })
            }}
          />
        )
      },
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      align: "center",
      render(value, record, index) {
        return (
          <Input
            value={record.remark}
            onChange={(e) => {
              tableRef.current?.patchRow(record.id, { remark: e.target.value })
            }}
          />
        )
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      key: "operation",
      width: 80,
      align: "center",
      render: (text, record: DictItemTableData) => (
        <BasicButton color="danger" variant="link">
          删除
        </BasicButton>
      ),
    },
  ]
  const getDetail = async (id: string) => {
    dispatch({ type: "INIT", loading: true })
    const data = await api.getDictDetail(id).finally(() => {
      dispatch({ type: "INIT", loading: false })
    })
    const { items, ...args } = data ?? {}
    form.setFieldsValue(args)
    tableRef.current.setTableData(items ?? [])
  }
  useEffect(() => {
    state.id && getDetail(state.id)
  }, [])
  const onCancel = () => {
    dispatch({
      type: "OPEN_DICTIONARY",
      visible: false,
      title: "",
      id: "",
    })
  }
  const handleSubmit = async () => {
    await form.validateFields()
    dispatch({
      type: "SUBMIT_LOADING",
      submitLoading: true,
    })
    const params = form.getFieldsValue()
    const tableData = tableRef.current?.getTableRecords() ?? []
    const items = state.id ? tableData : tableData?.map(({ id, ...rest }: { id: number }) => ({ ...rest }))
    const request = state.id ? api.updateDict : api.insertDict
    const data = !state.id ? params : { dictId: state.id, ...params }
    await request({ ...data, items }).finally(() => {
      dispatch({
        type: "SUBMIT_LOADING",
        submitLoading: false,
      })
    })
    onCancel()
    onOk && onOk()
    showMessage(`${state.title}成功`, "success")
  }
  return (
    <BasicDialog
      width={1000}
      title={title}
      open={visible}
      loading={state.loading}
      submitLoading={state.submitLoading}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <LayoutTitle title="基础信息" isShow={false}>
        <BasicForm
          formConfig={formConfig}
          otherFormConfig={{
            labelCol: { span: 3 },
            wrapperCol: { span: 21 },
            labelAlign: "right",
            colon: true,
            size: "middle",
            form,
            initialValues: { status: "0" },
          }}
        />
      </LayoutTitle>
      <LayoutTitle title="字典数据配置" isShow={false}>
        <BasicTable<DictItemTableData>
          ref={tableRef}
          columns={columns}
          isShowPage={false}
          otherTableProps={{
            scroll: { y: 300 },
          }}
        >
          <BasicTable.ToolbarRight>
            <BasicButton
              type="primary"
              onClick={() => {
                tableRef.current?.addTableRow({
                  id: crypto.randomUUID(),
                  dictLabel: "",
                  dictValue: "",
                })
              }}
            >
              添加行
            </BasicButton>
          </BasicTable.ToolbarRight>
        </BasicTable>
      </LayoutTitle>
    </BasicDialog>
  )
}
