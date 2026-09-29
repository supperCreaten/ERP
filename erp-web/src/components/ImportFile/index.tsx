import { Checkbox } from "antd"
import type { UploadFile as AntUploadFile, UploadProps } from "antd"
import { useState } from "react"
import BasicDialog from "../BasicDialog"
import BasicButton from "../BasicButton"
import UploadFile from "../UploadFile"
import { showMessage } from "@/utils/methods"

const EXCEL_ACCEPT = ".xlsx,.xls"

export type ImportResult = {
  hasError?: boolean
  errorCount?: number
  successCount?: number
  errorFile?: string
  errorFileName?: string
  message?: string
}

export type ImportOptions = {
  partialCommit: boolean
  onProgress?: (percent: number) => void
}

type ImportFileProps = {
  open: boolean
  onClose: () => void
  onImport?: (file: File, options: ImportOptions) => Promise<ImportResult | void>
  defaultPartialCommit?: boolean
  onDownloadTemplate?: () => void | Promise<void>
  onSuccess?: () => void
  title?: string
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

export default function ImportFile(props: ImportFileProps) {
  const {
    open,
    onClose,
    onImport,
    defaultPartialCommit = false,
    onDownloadTemplate,
    onSuccess,
    title = "导入文件",
  } = props
  const [file, setFile] = useState<File>()
  const [fileList, setFileList] = useState<AntUploadFile[]>([])
  const [loading, setLoading] = useState(false)
  const [partialCommit, setPartialCommit] = useState(defaultPartialCommit)
  const [errorFile, setErrorFile] = useState<{ base64: string; name: string } | null>(null)
  const [percent, setPercent] = useState(0)
  const [progressStatus, setProgressStatus] = useState<"normal" | "active" | "success" | "exception">("normal")
  const [progressTip, setProgressTip] = useState("")

  const handleChange: UploadProps["onChange"] = ({ fileList: nextList }) => {
    const latest = nextList.slice(-1)
    setFileList(latest)
    setFile(latest[0]?.originFileObj)
    setErrorFile(null)
    setPercent(0)
    setProgressStatus("normal")
    setProgressTip("")
  }

  const resetState = () => {
    setFile(undefined)
    setFileList([])
    setErrorFile(null)
    setLoading(false)
    setPartialCommit(defaultPartialCommit)
    setPercent(0)
    setProgressStatus("normal")
    setProgressTip("")
  }

  const handleCancel = () => {
    if (loading) return
    resetState()
    onClose()
  }

  const handleOk = async () => {
    if (!file) {
      showMessage("请先选择要导入的 Excel 文件", "warning")
      return
    }
    if (!onImport) {
      showMessage("未配置导入接口", "warning")
      return
    }

    setLoading(true)
    setErrorFile(null)
    setPercent(0)
    setProgressStatus("active")
    setProgressTip("正在上传文件...")

    try {
      const result = await onImport(file, {
        partialCommit,
        onProgress: (p) => {
          const next = Math.min(99, Math.max(0, Math.round(p)))
          setPercent(next)
          setProgressTip(next >= 99 ? "正在校验并导入数据..." : `正在上传文件... ${next}%`)
        },
      })

      if (result?.hasError && result.errorFile) {
        setPercent(100)
        setProgressStatus("exception")
        setProgressTip(result.message || "校验失败，请下载错误文件查看")
        setErrorFile({
          base64: result.errorFile,
          name: result.errorFileName || "导入错误明细.xlsx",
        })
        showMessage(result.message || "校验失败，请下载错误文件查看", "warning")
        if ((result.successCount ?? 0) > 0) {
          onSuccess?.()
        }
        return
      }

      setPercent(100)
      setProgressStatus("success")
      setProgressTip(result?.message || "导入成功")
      showMessage(result?.message || "导入成功", "success")
      onSuccess?.()
      resetState()
      onClose()
    } catch {
      setProgressStatus("exception")
      setProgressTip("导入失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasicDialog
      width={560}
      title={title}
      open={open}
      submitLoading={loading}
      okText="确定"
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ disabled: loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      {/* listType="text"：文件列表形式，非图片卡片 */}
      <UploadFile
        manual
        listType="text"
        accept={EXCEL_ACCEPT}
        maxCount={1}
        fileList={fileList}
        onChange={handleChange}
        disabled={loading}
        showUploadList={{ showRemoveIcon: !loading }}
        showProgress={loading || percent > 0 || progressStatus === "exception"}
        percent={percent}
        progressStatus={progressStatus}
        progressTip={progressTip}
      >
        <BasicButton type="link" title="导入文件" disabled={loading} />
      </UploadFile>
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
      {onDownloadTemplate && (
        <div className="mt-2">
          <BasicButton type="link" title="下载导入模板" disabled={loading} onClick={() => void onDownloadTemplate()} />
        </div>
      )}

      <div className="mt-3">
        <Checkbox checked={partialCommit} disabled={loading} onChange={(e) => setPartialCommit(e.target.checked)}>
          部分成功入库（勾选：失败行跳过、成功行入库；不勾选：任一失败则全部不入库）
        </Checkbox>
      </div>
    </BasicDialog>
  )
}
