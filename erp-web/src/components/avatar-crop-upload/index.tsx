import {
  MinusOutlined,
  PictureOutlined,
  PlusOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import MyDialog from "@/components/BasicDialog";
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, MouseEventHandler, ReactElement } from "react";

import request from "@/utils/request";
import { cropVisibleRegion } from "@/utils/cropImage";
import { FixedImageCropper, type CropFrame } from "./FixedImageCropper";

/** data URL 不走 fetch（超长 base64 时 fetch 易失败），直接解码为 Blob */
function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const comma = dataUrl.indexOf(",");
    if (comma === -1 || !dataUrl.startsWith("data:")) {
      return null;
    }
    const meta = dataUrl.slice(5, comma);
    const payload = dataUrl.slice(comma + 1);
    const mimePart = meta.split(";")[0]?.trim() || "image/png";
    const mime = mimePart || "image/png";
    if (meta.includes("base64")) {
      const bin = atob(payload);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        arr[i] = bin.charCodeAt(i);
      }
      return new Blob([arr], { type: mime });
    }
    const decoded = decodeURIComponent(payload);
    return new Blob([decoded], { type: mime });
  } catch {
    return null;
  }
}

/** 触发元素需支持 onClick（如 Button、原生 button）；点击先打开弹窗，在弹窗内再选图 */
export type AvatarCropTriggerProps = {
  onClick?: MouseEventHandler<HTMLElement>;
};

export type AvatarCropUploadProps = {
  /** 上传成功后回调（POST /avatar 不返回图片数据；请自行拉 userInfo） */
  onUploaded?: () => void;
  cropShape?: "round" | "rect";
  children: ReactElement<AvatarCropTriggerProps>;
  /** 已解析的可访问 URL：上次保存的全图，打开弹窗时载入左侧裁剪区并作为提交时的 full */
  initialFullImageUrl?: string;
  /** 已解析的可访问 URL：当前裁剪结果图，打开弹窗时作为右侧初始预览 */
  initialCroppedImageUrl?: string;
};

export function AvatarCropUpload({
  onUploaded,
  cropShape = "round",
  children,
  initialFullImageUrl,
  initialCroppedImageUrl,
}: AvatarCropUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const originalFileRef = useRef<File | null>(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const cropFrameRef = useRef<CropFrame | null>(null);
  /** 仅用于顶部尺寸文案 */
  const [dimensionLabel, setDimensionLabel] = useState("— × —");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  /** 弹窗打开后再挂载裁剪器，避免与弹窗入场动画抢主线程 */
  const [cropperReady, setCropperReady] = useState(false);
  /** 服务端保存的裁剪预览 URL，在本地裁剪预览生成前展示 */
  const [serverCropPreview, setServerCropPreview] = useState<string | null>(null);
  /** 正在拉取 initialFullImageUrl / initialCroppedImageUrl 作为裁剪源 */
  const [hydratingInitial, setHydratingInitial] = useState(false);
  const hydrationAbortRef = useRef<AbortController | null>(null);

  /** 正方形裁剪框边长（舞台坐标 px） */
  const cropViewPx = 180;

  const revokeBlob = useCallback((url: string | null) => {
    if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  }, []);

  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPreview = useCallback(async () => {
    if (!open || !imageSrc) return;
    const frame = cropFrameRef.current;
    if (!frame) return;
    const baseScale = Math.max(
      frame.stageWidth / frame.naturalWidth,
      frame.stageHeight / frame.naturalHeight,
    );
    const outSize = Math.max(1, Math.round(frame.box.size / (baseScale * zoom)));
    setDimensionLabel(`${outSize} × ${outSize}`);
    try {
      const blob = await cropVisibleRegion({
        imageSrc,
        ...frame,
        zoom,
        rotation,
      });
      if (!blob) return;
      const next = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        revokeBlob(prev);
        return next;
      });
    } catch {
      /* 预览失败时保留上一帧 */
    }
  }, [open, imageSrc, zoom, rotation, revokeBlob]);

  const schedulePreview = useCallback(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      previewTimerRef.current = null;
      void flushPreview();
    }, 200);
  }, [flushPreview]);

  const onCropFrameChange = useCallback(
    (frame: CropFrame) => {
      cropFrameRef.current = frame;
      schedulePreview();
    },
    [schedulePreview],
  );

  /** 缩放 / 旋转后刷新预览 */
  useEffect(() => {
    if (!open || !imageSrc || !cropperReady) return;
    schedulePreview();
  }, [zoom, rotation, open, imageSrc, cropperReady, schedulePreview]);

  useEffect(() => {
    if (!open || !imageSrc) {
      setCropperReady(false);
      return;
    }
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setCropperReady(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [open, imageSrc]);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  /** 主样式见 bundled-layer.css；此处只补结构与圆角 */
  const modalStyles = useMemo(
    () => ({
      content: {
        padding: 0,
        overflow: "hidden" as const,
        borderRadius: 16,
      },
      header: {
        marginBottom: 0,
        padding: "18px 24px 16px",
        borderBottom: "none",
        background: "transparent",
      },
      body: {
        padding: "0 24px 16px",
        background: "transparent",
      },
      footer: {
        margin: 0,
        padding: "14px 24px 18px",
        borderTop: "1px solid rgb(15 23 42 / 8%)",
        background: "transparent",
      },
    }),
    [],
  );

  const resetState = useCallback(() => {
    setZoom(1);
    setRotation(0);
    cropFrameRef.current = null;
    setDimensionLabel("— × —");
    setCropperReady(false);
    setPreviewUrl((prev) => {
      revokeBlob(prev);
      return null;
    });
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  }, [revokeBlob]);

  /** 打开弹窗时：右侧展示上次裁剪图 URL；左侧拉取全图（无全图则用裁剪图 URL）为 Blob 供裁剪与提交 full */
  useEffect(() => {
    if (!open) {
      setServerCropPreview(null);
      setHydratingInitial(false);
      hydrationAbortRef.current?.abort();
      hydrationAbortRef.current = null;
      return;
    }

    const previewUrl =
      initialCroppedImageUrl ?? initialFullImageUrl ?? null;
    setServerCropPreview(previewUrl);

    const sourceUrl = initialFullImageUrl ?? initialCroppedImageUrl;
    if (!sourceUrl) {
      setHydratingInitial(false);
      return;
    }

    const ac = new AbortController();
    hydrationAbortRef.current = ac;
    setHydratingInitial(true);

    void (async () => {
      try {
        let blob: Blob | null = null;
        if (sourceUrl.startsWith("data:")) {
          if (ac.signal.aborted) {
            return;
          }
          blob = dataUrlToBlob(sourceUrl);
          if (!blob?.type.startsWith("image/")) {
            blob = null;
          }
        } else {
          const res = await fetch(sourceUrl, {
            credentials: "include",
            signal: ac.signal,
          });
          if (!res.ok) {
            throw new Error("fetch failed");
          }
          blob = await res.blob();
          if (!blob.type.startsWith("image/")) {
            throw new Error("not image");
          }
        }
        if (!blob) {
          throw new Error("not image");
        }
        const file = new File([blob], "full.jpg", {
          type: blob.type || "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        if (ac.signal.aborted) {
          URL.revokeObjectURL(url);
          return;
        }
        originalFileRef.current = file;
        resetState();
        setImageSrc((prev) => {
          if (prev?.startsWith("blob:")) {
            URL.revokeObjectURL(prev);
          }
          return url;
        });
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          return;
        }
        originalFileRef.current = null;
      } finally {
        if (!ac.signal.aborted) {
          setHydratingInitial(false);
        }
      }
    })();

    return () => {
      ac.abort();
    };
  }, [open, initialFullImageUrl, initialCroppedImageUrl, resetState]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setImageSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    originalFileRef.current = null;
    resetState();
  }, [resetState]);

  const pickFile = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file?.type.startsWith("image/")) {
        window.$message?.warning("请选择图片文件");
        return;
      }
      originalFileRef.current = file;
      const url = URL.createObjectURL(file);
      setServerCropPreview(null);
      setImageSrc(url);
      resetState();
    },
    [resetState],
  );

  const triggerClick = useCallback<MouseEventHandler<HTMLElement>>(
    (e) => {
      children.props.onClick?.(e);
      if (e.defaultPrevented) return;
      setOpen(true);
    },
    [children.props.onClick],
  );

  const handleSubmit = useCallback(async () => {
    const frame = cropFrameRef.current;
    if (!imageSrc || !frame) {
      window.$message?.warning("请等待图片加载完成");
      return;
    }
    setUploading(true);
    try {
      const blob = await cropVisibleRegion({
        imageSrc,
        ...frame,
        zoom,
        rotation,
      });
      if (!blob) throw new Error("裁剪失败");

      /** multipart：file=裁剪图，full=原图（无原图时与裁剪图为同一 Blob）；服务端按登录用户写入 sys_user.avatar / full_avatar（LONGBLOB） */
      const fd = new FormData();
      fd.append("file", blob, "avatar.png");
      const fullFile = originalFileRef.current;
      fd.append("full", fullFile ?? blob, fullFile ? fullFile.name : "full.png");

      const res = (await request.post("/api/user/avatar", fd)) as { code?: number; msg?: string };
      if (res?.code === 200) {
        window.$message?.success("头像上传成功");
        onUploaded?.();
        handleClose();
      } else {
        window.$message?.error(res?.msg || "上传失败，请重试");
      }
    } catch {
      window.$message?.error("上传失败，请重试");
    } finally {
      setUploading(false);
    }
  }, [imageSrc, zoom, rotation, onUploaded, handleClose]);

  const zoomIn = () => setZoom((z) => Math.min(3, parseFloat((z + 0.1).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(1, parseFloat((z - 0.1).toFixed(2))));
  const rotateLeft = () => setRotation((r) => r - 90);
  const rotateRight = () => setRotation((r) => r + 90);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden
        onChange={onFileChange}
      />
      {isValidElement(children)
        ? cloneElement(children, { onClick: triggerClick } satisfies Partial<AvatarCropTriggerProps>)
        : children}

      <MyDialog
        title={
          <div className="avatar-crop-upload__title flex gap-3 pr-6">
            <div className="avatar-crop-upload__title-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 via-indigo-500 to-cyan-400 text-lg text-white shadow-md shadow-indigo-500/30">
              <PictureOutlined />
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="text-base font-semibold tracking-tight text-slate-800">修改头像</div>
              <p className="mt-0.5 text-xs font-normal leading-relaxed text-slate-500">
                拖拽移动裁剪框，按钮缩放或旋转，右侧同步预览
              </p>
            </div>
          </div>
        }
        open={open}
        onCancel={handleClose}
        width={820}
        viewportPadding={40}
        destroyOnHidden
        maskClosable={false}
        keyboard={false}
        footer={
          <div className="avatar-crop-upload__footer-actions">
            <button type="button" className="avatar-crop-upload__btn-cancel" onClick={handleClose}>
              取消
            </button>
            <button
              type="button"
              className="avatar-crop-upload__btn-ok"
              disabled={uploading || !imageSrc}
              onClick={() => void handleSubmit()}
            >
              {uploading ? "提交中…" : "提交"}
            </button>
          </div>
        }
        rootClassName="avatar-crop-upload__root"
        className="avatar-crop-upload__modal"
        transitionName=""
        maskTransitionName=""
        styles={modalStyles}
      >
        <div
          className="avatar-crop-upload__header-rule mb-5 h-px w-full bg-linear-to-r from-transparent via-slate-400/35 to-transparent"
          aria-hidden
        />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
            <div className="min-w-0 flex-1">
              <div className="mb-2 avatar-crop-upload__stage-label flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">裁剪区域</span>
                <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  1 : 1
                </span>
              </div>
              <div className="avatar-crop-upload__stage-frame rounded-2xl p-px">
                <div className="avatar-crop-upload__stage relative h-[min(58vh,448px)] min-h-72 overflow-hidden rounded-[15px]">
                  <div className="avatar-crop-upload__dim-badge pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 tabular-nums">
                    {dimensionLabel}
                  </div>
                  {imageSrc && cropperReady ? (
                    <FixedImageCropper
                      imageSrc={imageSrc}
                      zoom={zoom}
                      rotation={rotation}
                      cropViewPx={cropViewPx}
                      onCropFrameChange={onCropFrameChange}
                    />
                  ) : imageSrc ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      图片加载中…
                    </div>
                  ) : hydratingInitial ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-slate-400">
                      <PictureOutlined className="text-3xl opacity-60" />
                      <span>正在加载上次头像…</span>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                      <PictureOutlined className="text-4xl opacity-70" />
                      <p className="text-sm text-slate-500">请先点击下方「选择图片」</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col items-center lg:w-60">
              <div className="mb-2! w-full text-left lg:text-center ">
                <span className="text-xs font-medium text-slate-500">预览</span>
              </div>
              <div className="avatar-crop-upload__preview-shell w-full max-w-50">
                <div
                  className={`avatar-crop-upload__preview-ring relative flex aspect-square w-[56vw] max-w-full items-center justify-center overflow-hidden border border-slate-200 bg-slate-100/80 shadow-inner ${cropShape === "round" ? "rounded-full" : "rounded-2xl"
                    }`}
                >
                  {previewUrl ?? serverCropPreview ? (
                    <img
                      src={(previewUrl ?? serverCropPreview)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : !imageSrc && !hydratingInitial ? (
                    <div className="flex flex-col items-center gap-1 px-4 text-center">
                      <span className="text-xs text-slate-400">未选择图片</span>
                      <span className="text-xs text-slate-500/90">选择后将显示预览</span>
                    </div>
                  ) : !imageSrc && hydratingInitial ? (
                    <div className="flex flex-col items-center gap-1 px-4 text-center">
                      <span className="text-xs text-slate-400">加载预览图…</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 px-4 text-center">
                      <span className="text-xs text-slate-400">生成预览中</span>
                      <span className="text-xs text-slate-500/90">调整左侧选区后显示</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="avatar-crop-upload__toolbar avatar-crop-upload__bar">
            <div className="avatar-crop-upload__bar-tools">
              <div className="avatar-crop-upload__strip" role="toolbar" aria-label="修改工具">
                <button type="button" className="avatar-crop-upload__strip-btn" onClick={pickFile}>
                  <UploadOutlined />
                  选择图片
                </button>
                <span className="avatar-crop-upload__strip-rule avatar-crop-upload__strip-rule--hide-sm" aria-hidden />
                <div className="avatar-crop-upload__strip-group" role="group" aria-label="缩放">
                  <Tooltip title="缩小" placement="top" mouseEnterDelay={0.35}>
                    <button
                      type="button"
                      className="avatar-crop-upload__icon-tool"
                      onClick={zoomOut}
                      aria-label="缩小"
                      disabled={!imageSrc}
                    >
                      <MinusOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="放大" placement="top" mouseEnterDelay={0.35}>
                    <button
                      type="button"
                      className="avatar-crop-upload__icon-tool"
                      onClick={zoomIn}
                      aria-label="放大"
                      disabled={!imageSrc}
                    >
                      <PlusOutlined />
                    </button>
                  </Tooltip>
                </div>
                <span className="avatar-crop-upload__strip-rule avatar-crop-upload__strip-rule--hide-sm" aria-hidden />
                <div className="avatar-crop-upload__strip-group" role="group" aria-label="旋转">
                  <Tooltip title="逆时针旋转" placement="top" mouseEnterDelay={0.35}>
                    <button
                      type="button"
                      className="avatar-crop-upload__icon-tool"
                      onClick={rotateLeft}
                      aria-label="逆时针旋转"
                      disabled={!imageSrc}
                    >
                      <RotateLeftOutlined />
                    </button>
                  </Tooltip>
                  <Tooltip title="顺时针旋转" placement="top" mouseEnterDelay={0.35}>
                    <button
                      type="button"
                      className="avatar-crop-upload__icon-tool"
                      onClick={rotateRight}
                      aria-label="顺时针旋转"
                      disabled={!imageSrc}
                    >
                      <RotateRightOutlined />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MyDialog>
    </>
  );
}
