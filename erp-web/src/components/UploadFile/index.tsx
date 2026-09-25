import { Upload, type UploadFile, UploadProps, Image, GetProp } from "antd"
import { UploadChangeParam } from "antd/es/upload"
import { UploadRef } from "antd/es/upload/Upload"
import { RefAttributes, useState } from "react"
import { JSX } from "react/jsx-runtime"
import { getBase64 } from "@/utils/methods"
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

/** 上传返回的 fileName 形如 /profile/upload/...，开发环境需经 /api 代理访问 */
function toDisplayUrl(res?: UploadResult, fallback?: string) {
  if (res?.fileName) {
    const path = res.fileName.startsWith("/") ? res.fileName : `/${res.fileName}`
    return path.startsWith("/api/") ? path : `/api${path}`
  }
  return res?.url || fallback
}

export default function UploadFile(props: JSX.IntrinsicAttributes & UploadProps<any> & RefAttributes<UploadRef<any>>) {
  const { children, maxCount = 1, fileList, listType = "picture-card", ...restProps } = props
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState("")

  const request: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append("file", file as File)
    try {
      const res = (await api.uploadApi(formData)) as UploadResult
      onSuccess?.(res)
    } catch (err) {
      onError?.(err as Error)
    }
  }

  const onChange = (info: UploadChangeParam<UploadFile<UploadResult>>) => {
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
        customRequest={request}
        fileList={fileList}
        maxCount={maxCount}
        onChange={onChange}
        onPreview={onPreview}
      >
        <BasicButton type="link">上传</BasicButton>
      </Upload>
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
    </>
  )
}
