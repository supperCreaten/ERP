import type { AxiosProgressEvent, AxiosRequestConfig } from "axios"
import { Progress, Upload, type UploadFile, UploadProps, Image, GetProp } from "antd"
import { UploadChangeParam } from "antd/es/upload"
import { type ReactNode, useState } from "react"
import { getBase64, showMessage } from "@/utils/methods"
import api from "@/api"
import BasicButton from "../BasicButton"

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0]

type UploadResult = {
  fileId?: number
  url?: string
  fileName?: string
  newFileName?: string
  originalFilename?: string
}

export type UploadFileExtraProps = {
  /** 手动选文件，不自动上传（导入场景） */
  manual?: boolean
  /** 展示上传进度条 */
  showProgress?: boolean
  /** 受控进度 0-100（业务导入时可外部传入） */
  percent?: number
  progressStatus?: "normal" | "active" | "success" | "exception"
  progressTip?: ReactNode
}

type Props = UploadProps & UploadFileExtraProps

/** 上传返回的 fileName 形如 /profile/upload/...，开发环境需经 /api 代理访问 */
function toDisplayUrl(res?: UploadResult, fallback?: string) {
  if (res?.fileName) {
    const path = res.fileName.startsWith("/") ? res.fileName : `/${res.fileName}`
    return path.startsWith("/api/") ? path : `/api${path}`
  }
  return res?.url || fallback
}

function matchAccept(fileName: string, accept?: string) {
  if (!accept || accept === "*" || accept.includes("*/*")) return true
  const name = fileName.toLowerCase()
  const rules = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
  return rules.some((rule) => {
    if (rule.startsWith(".")) return name.endsWith(rule)
    if (rule.endsWith("/*")) return true
    return name.endsWith(rule)
  })
}

export default function UploadFile(props: Props) {
  const {
    children,
    maxCount = 1,
    fileList,
    listType = "picture-card",
    manual = false,
    showProgress = false,
    percent: percentProp,
    progressStatus = "normal",
    progressTip,
    accept,
    beforeUpload: beforeUploadProp,
    disabled,
    customRequest: customRequestProp,
    onPreview: onPreviewProp,
    ...restProps
  } = props

  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState("")
  const [innerPercent, setInnerPercent] = useState(0)
  const [innerStatus, setInnerStatus] = useState<"normal" | "active" | "success" | "exception">("normal")

  const percent = percentProp ?? innerPercent
  const status = percentProp != null ? progressStatus : innerStatus
  const isPictureMode = listType === "picture-card" || listType === "picture-circle"

  const request: UploadProps["customRequest"] = async (options) => {
    if (customRequestProp) {
      return customRequestProp(options)
    }
    const { file, onSuccess, onError, onProgress } = options
    const formData = new FormData()
    formData.append("file", file as File)
    setInnerPercent(0)
    setInnerStatus("active")
    try {
      const res = (await api.uploadApi(formData, {
        onUploadProgress: (event: AxiosProgressEvent) => {
          if (!event.total) return
          const p = Math.round((event.loaded / event.total) * 100)
          setInnerPercent(p)
          onProgress?.({ percent: p })
        },
      } as AxiosRequestConfig)) as UploadResult
      setInnerPercent(100)
      setInnerStatus("success")
      onSuccess?.(res)
    } catch (err) {
      setInnerStatus("exception")
      onError?.(err as Error)
    }
  }

  const beforeUpload: UploadProps["beforeUpload"] = (file, fileListArg) => {
    if (accept && !matchAccept(file.name, accept)) {
      showMessage(`仅支持上传 ${accept} 格式的文件`, "warning")
      return Upload.LIST_IGNORE
    }
    if (beforeUploadProp) {
      return beforeUploadProp(file, fileListArg)
    }
    if (manual) return false
    return true
  }

  const onChange = (info: UploadChangeParam<UploadFile<UploadResult>>) => {
    if (manual) {
      props?.onChange?.(info)
      return
    }

    const nextFileList = info.fileList.map((item) => {
      if (item.uid === info.file.uid && (info.file.status === "done" || item.status === "done")) {
        const res = (info.file.response ?? item.response) as UploadResult | undefined
        const url = toDisplayUrl(res, item.url)
        return {
          ...item,
          status: "done" as const,
          url,
          thumbUrl: url || item.thumbUrl,
          name: res?.originalFilename || res?.newFileName || item.name,
          response: res,
          ...(res?.fileId != null ? { fileId: res.fileId } : {}),
        }
      }
      if (item.uid === info.file.uid && info.file.percent != null) {
        setInnerPercent(Math.round(info.file.percent))
      }
      return item
    })
    const current = nextFileList.find((f) => f.uid === info.file.uid)
    props?.onChange?.({
      ...info,
      file: current ? { ...info.file, ...current } : info.file,
      fileList: nextFileList,
    })
  }

  const onPreview = async (file: UploadFile) => {
    if (onPreviewProp) {
      onPreviewProp(file)
      return
    }
    if (!isPictureMode) return
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  return (
    <>
      <Upload
        action="#"
        listType={listType}
        {...restProps}
        accept={accept}
        customRequest={manual ? undefined : request}
        fileList={fileList}
        maxCount={maxCount}
        beforeUpload={beforeUpload}
        onChange={onChange}
        onPreview={onPreview}
        disabled={disabled}
      >
        {children ?? <BasicButton type="link">上传</BasicButton>}
      </Upload>
      {showProgress && (percent > 0 || status === "active" || status === "exception") && (
        <div className="mt-3">
          <Progress percent={percent} status={status === "normal" ? undefined : status} />
          {progressTip && <div className="mt-1 text-center text-sm text-gray-500">{progressTip}</div>}
        </div>
      )}
      {isPictureMode && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            src: previewImage || undefined,
            onVisibleChange: (visible) => {
              setPreviewOpen(visible)
              if (!visible) setPreviewImage("")
            },
          }}
        />
      )}
    </>
  )
}
