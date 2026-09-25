import { Checkbox, Upload, type UploadFile, type UploadProps } from "antd"
import { useState } from "react"
import BasicDialog from "../BasicDialog"
import BasicButton from "../BasicButton"
import { showMessage } from "@/utils/methods"

export type ImportResult = {
  hasError?: boolean
  errorCount?: number
  successCount?: number
  errorFile?: string
  errorFileName?: string
  message?: string
}

export type ImportOptions = {
  /** 是否允许部分成功入库 */
  partialCommit: boolean
}

type ImportUploadProps = {
  open: boolean
  onCancel: () => void
  /** 执行导入；校验失败时返回含 errorFile 的结果，弹窗内可下载错误文件 */
  onImport: (file: File, options: ImportOptions) => Promise<ImportResult | void>
  /** 「允许部分成功入库」默认值，默认 false */
  defaultPartialCommit?: boolean
  /** 下载导入模板 */
  onDownloadTemplate?: () => void | Promise<void>
}

function downloadBase64File(base64: string, fileName: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName || "导入错误明细.xlsx"
  link.click()
  URL.revokeObjectURL(url)
}

export default function ImportUpload(props: ImportUploadProps) {
  const { open, onCancel, onImport, defaultPartialCommit = false, onDownloadTemplate } = props
  const [file, setFile] = useState<File>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [loading, setLoading] = useState(false)
  const [partialCommit, setPartialCommit] = useState(defaultPartialCommit)
  const [errorFile, setErrorFile] = useState<{ base64: string; name: string } | null>(null)

  const beforeUpload: UploadProps["beforeUpload"] = () => false

  const handleChange: UploadProps["onChange"] = ({ fileList: nextList }) => {
    const latest = nextList.slice(-1)
    setFileList(latest)
    setFile(latest[0]?.originFileObj)
    setErrorFile(null)
  }

  const resetState = () => {
    setFile(undefined)
    setFileList([])
    setErrorFile(null)
    setLoading(false)
    setPartialCommit(defaultPartialCommit)
  }

  const handleCancel = () => {
    resetState()
    onCancel()
  }

  const handleOk = async () => {
    if (!file) {
      showMessage("请先选择要导入的文件", "warning")
      return
    }
    setLoading(true)
    try {
      const result = await onImport(file, { partialCommit })
      if (result?.hasError && result.errorFile) {
        setErrorFile({
          base64: result.errorFile,
          name: result.errorFileName || "导入错误明细.xlsx",
        })
        showMessage(result.message || "校验失败，请下载错误文件查看", "warning")
        return
      }
      resetState()
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasicDialog
      title="导入"
      open={open}
      submitLoading={loading}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Upload
        listType="text"
        maxCount={1}
        accept=".xlsx,.xls"
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        children={<BasicButton title="选择文件" type="link" />}
      />
      {onDownloadTemplate && (
        <div className="mt-2">
          <BasicButton type="link" title="下载导入模板" onClick={() => void onDownloadTemplate()} />
        </div>
      )}
      <div className="mt-3">
        <Checkbox checked={partialCommit} onChange={(e) => setPartialCommit(e.target.checked)}>
          部分成功入库（勾选：失败行跳过、成功行入库；不勾选：任一失败则全部不入库）
        </Checkbox>
      </div>
      {errorFile && (
        <div className="mt-3">
          <BasicButton
            type="link"
            danger
            title="下载错误文件"
            onClick={() => downloadBase64File(errorFile.base64, errorFile.name)}
          />
        </div>
      )}
    </BasicDialog>
  )
}
