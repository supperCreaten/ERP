import { Card, Typography } from "antd";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import ContentSection from "@/components/ContentSection";

export default function HomePage() {
  const userInfo = useSelector((state: RootState) => state.user.userInfo ?? {});
  const nickName =
    (userInfo.nickName as string) ||
    (userInfo.userName as string) ||
    (userInfo.account as string) ||
    "用户";

  return (
    <ContentSection>
      <ContentSection.Content>
        <Card variant="borderless" className="shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
          <Typography.Title level={3} className="!mb-2">
            欢迎回来，{nickName}
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            ERP 管理系统 — 从左侧菜单进入各业务模块。
          </Typography.Paragraph>
        </Card>
      </ContentSection.Content>
    </ContentSection>
  );
}
