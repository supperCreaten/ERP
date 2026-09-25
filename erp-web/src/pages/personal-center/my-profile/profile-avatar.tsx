import { Avatar } from "antd";

import { AvatarCropUpload } from "@/components/avatar-crop-upload";

type ProfileAvatarUploadProps = {
  /** 展示用的头像地址（已带域名或相对路径） */
  src?: string;
  /** 上次保存的全图（可访问 URL），打开弹窗时载入裁剪区 */
  initialFullImageUrl?: string;
  /** 上次保存的裁剪结果（可访问 URL），打开弹窗时作为右侧初始预览 */
  initialCroppedImageUrl?: string;
  /** 上传成功后回调（头像数据请从 userInfo 获取） */
  onUploaded?: () => void;
};

/**
 * 个人中心头像：点击头像直接打开弹窗；若有服务端头像则默认展示全图与当前裁剪预览。
 */
export function ProfileAvatarUpload({
  src,
  initialFullImageUrl,
  initialCroppedImageUrl,
  onUploaded,
}: ProfileAvatarUploadProps) {
  return (
    <AvatarCropUpload
      cropShape="round"
      initialFullImageUrl={initialFullImageUrl}
      initialCroppedImageUrl={initialCroppedImageUrl}
      onUploaded={onUploaded}
    >
      <button
        type="button"
        className="group relative cursor-pointer rounded-full border-0 bg-transparent p-0 focus:outline-none"
        aria-label="修改头像"
      >
        <Avatar size={120} src={src} className="border border-solid border-[#e8e8e8] shadow-sm" />
        <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/45 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          <span>修改头像</span>
        </span>
      </button>
    </AvatarCropUpload>
  );
}
