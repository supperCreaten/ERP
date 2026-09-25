import MyDialog from "@/components/BasicDialog";
import { Descriptions, Spin, Tag } from "antd";

export type LoginLogDetailData = {
  infoId?: number;
  userName?: string;
  ipaddr?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  status?: string;
  msg?: string;
  loginTime?: string;
  userAgent?: string;
  clientType?: "web" | "app" | string;
};

type LoginLogDetailProps = {
  open: boolean;
  loading: boolean;
  detail: LoginLogDetailData | null;
  onClose: () => void;
};

export default function LoginLogDetail({ open, loading, detail, onClose }: LoginLogDetailProps) {
  return (
    <MyDialog title="登录日志详情" open={open} width={720} footer={null} onCancel={onClose}>
      <Spin spinning={loading}>
        {detail ? (
          <Descriptions bordered size="small" column={1} styles={{ label: { width: 120, fontWeight: 500 } }}>
            <Descriptions.Item label="访问编号">{detail?.infoId}</Descriptions.Item>
            <Descriptions.Item label="客户端类型">
              {detail?.clientType === "app" ? (
                <Tag color="purple">App端</Tag>
              ) : (
                <Tag color="blue">管理端</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="用户名称">{detail?.userName ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="登录地址">{detail?.ipaddr ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="登录地点">{detail?.loginLocation ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="操作系统">{detail?.os ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="浏览器">{detail?.browser ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="登录状态">
              {detail?.status === '0' ? <Tag color="processing">成功</Tag> : <Tag color="error">失败</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="描述">{detail?.msg ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="访问时间">{detail?.loginTime ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="User-Agent">
              <span className="break-all text-xs text-slate-600">{detail?.userAgent ?? "—"}</span>
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Spin>
    </MyDialog>
  );
}
