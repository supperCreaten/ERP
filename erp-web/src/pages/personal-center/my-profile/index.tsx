import ContentSection from "@/components/ContentSection";
import api from "@/api";
import { setUserInfo } from "@/store/modules/user";
import { resolvePublicUrl } from "@/utils/publicUrl";
import { getValueFromTtim, useAppDispatch } from "@/utils/methods";
import {
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProForm } from "@ant-design/pro-components";
import type { ProFormInstance } from "@ant-design/pro-components";
import type { DescriptionsProps } from "antd";
import AntButton from "@/components/BasicButton";
import { Card, Col, Descriptions, Divider, Input, Radio, Row, Space, Tabs, Typography } from "antd";
import { useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { ProfileAvatarUpload } from "./profile-avatar";

function formatDisplayTime(v?: string) {
  if (!v) {
    return "";
  }
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    return v;
  }
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(/\//g, "-");
}

function displayField(v?: string | null) {
  const t = typeof v === "string" ? v.trim() : "";
  return t || "—";
}

/**
 * 单行省略；仅在发生省略时悬停展示全文（antd Typography 内置溢出检测）。
 * 外层固定「宽度盒子」，配合 Descriptions 上 table-fixed，避免 td 被内容撑开导致永远测不出溢出。
 */
function EllipsisValue({ text }: { text: string }) {
  if (text === "—") {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }
  return (
     <Typography.Text
        ellipsis={{
          tooltip: text
        }}
      >
        {text}
      </Typography.Text>
  );
}

export default function Profile() {
  const dispatch = useAppDispatch();
  const userInfo = useSelector((state: { user: { userInfo?: Record<string, unknown> } }) => state.user.userInfo ?? {});
  const basicFormRef = useRef<ProFormInstance>(undefined);
  const pwdFormRef = useRef<ProFormInstance>(undefined);

  const avatarSrc = useMemo(() => {
    const raw = typeof userInfo?.avatar === "string" ? userInfo.avatar : "";
    return resolvePublicUrl(raw.trim() || undefined) || "https://avatar.vercel.sh/user.svg";
  }, [userInfo?.avatar]);

  /** userInfo 中为 data URL 或相对路径；传给 AvatarCropUpload 供弹窗内 hydration（需可解码为图片 Blob） */
  const initialAvatarHydration = useMemo((): {
    full: string | undefined;
    crop: string | undefined;
  } => {
    const avatarStr = typeof userInfo?.avatar === "string" ? userInfo.avatar.trim() : "";
    if (!avatarStr) {
      return { full: undefined, crop: undefined };
    }
    const fullAvatarStr =
      typeof userInfo?.fullAvatar === "string" ? userInfo.fullAvatar.trim() : "";
    const baseForFull = fullAvatarStr || avatarStr;
    const full = resolvePublicUrl(baseForFull);
    const crop = resolvePublicUrl(avatarStr);
    return { full, crop };
  }, [userInfo?.avatar, userInfo?.fullAvatar]);

  const initialBasic = useMemo(
    () => ({
      nickName: (userInfo?.nickName as string) || (userInfo?.userName as string) || "",
      phone: (userInfo?.phone as string) ?? "",
      email: (userInfo?.email as string) ?? "",
      sex: (userInfo?.sex as string) ?? "男",
    }),
    [userInfo?.email, userInfo?.phone, userInfo?.sex, userInfo?.nickName, userInfo?.userName],
  );

  const refreshUserInfo = async () => {
    try {
      const res = await api.getUserInfo();
      const payload = res?.data as Record<string, unknown> | undefined;
      if (payload && Object.keys(payload).length > 0) {
        dispatch(setUserInfo(payload));
      }
    } catch {
      /* ignore */
    }
  };

  const onAvatarUploaded = async () => {
    await refreshUserInfo();
  };

  const descriptionItems: DescriptionsProps["items"] = useMemo(
    () => [
      {
        key: "account",
        label: (
          <Space size={8}>
            <UserOutlined className="text-[rgba(0,0,0,0.45)]" />
            <span>登录账号</span>
          </Space>
        ),
        children: <EllipsisValue text={displayField(userInfo?.account as string)} />,
      },
      {
        key: "nickName",
        label: (
          <Space size={8}>
            <UserOutlined className="text-[rgba(0,0,0,0.45)]" />
            <span>用户昵称</span>
          </Space>
        ),
        children: (
          <EllipsisValue
            text={displayField((userInfo?.nickName as string) || (userInfo?.userName as string))}
          />
        ),
      },
      {
        key: "phone",
        label: (
          <Space size={8}>
            <PhoneOutlined className="text-[rgba(0,0,0,0.45)]" />
            <span>手机号码</span>
          </Space>
        ),
        children: <EllipsisValue text={displayField(userInfo?.phone as string)} />,
      },
      {
        key: "email",
        label: (
          <Space size={8}>
            <MailOutlined className="text-[rgba(0,0,0,0.45)]" />
            <span>用户邮箱</span>
          </Space>
        ),
        children: <EllipsisValue text={displayField(userInfo?.email as string)} />,
      },
      {
        key: "role",
        label: (
          <Space size={8}>
            <SafetyCertificateOutlined className="text-[rgba(0,0,0,0.45)]" />
            <span>所属角色</span>
          </Space>
        ),
        children: <EllipsisValue text={displayField(userInfo?.roleName as string)} />,
      },
      {
        key: "createTime",
        label: (
          <Space size={8}>
            <CalendarOutlined className="text-[rgba(0,0,0,0.45)]" />
            <span>创建日期</span>
          </Space>
        ),
        children: (
          <EllipsisValue text={displayField(formatDisplayTime(userInfo?.createTime as string))} />
        ),
      },
    ],
    [userInfo],
  );

  return (
    <ContentSection>
      <ContentSection.Content>
      <Row gutter={[16, 16]} className="max-w-full">
        <Col xs={24} lg={8} className="min-w-0">
          <Card
            title="个人信息"
            variant="borderless"
            className="shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]"
          >
            <div className="flex flex-col items-center pb-2">
              <ProfileAvatarUpload
                src={avatarSrc}
                initialFullImageUrl={initialAvatarHydration.full}
                initialCroppedImageUrl={initialAvatarHydration.crop}
                onUploaded={onAvatarUploaded}
              />
            </div>
            <Divider size="middle" />
            <Descriptions
              className="mt-2 [&.ant-descriptions-bordered_.ant-descriptions-view>table]:w-full! [&.ant-descriptions-bordered_.ant-descriptions-view>table]:table-fixed"
              title="资料概览"
              bordered
              column={1}
              size="middle"
              items={descriptionItems}
              styles={{
                label: { width: 132, whiteSpace: "nowrap" as const },
                content: {
                  minWidth: 0,
                  overflow: "hidden" as const,
                  verticalAlign: "middle" as const,
                },
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16} className="min-w-0">
          <Card variant="borderless" className="shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]" styles={{ body: { paddingTop: 8 } }}>
            <Tabs
              defaultActiveKey="basic"
              items={[
                {
                  key: "basic",
                  label: "基本资料",
                  children: (
                    <ProForm
                      formRef={basicFormRef}
                      layout="horizontal"
                      labelCol={{ flex: "100px" }}
                      wrapperCol={{ flex: 1 }}
                      initialValues={initialBasic}
                      requiredMark
                      submitter={{
                        render: (_, dom) => (
                          <div className="mt-8 flex w-full justify-center">
                            <Space size="middle" className="flex-wrap justify-center">
                              {dom[1]}
                              <AntButton
                                onClick={() => basicFormRef.current?.resetFields()}
                              >
                                关闭
                              </AntButton>
                            </Space>
                          </div>
                        ),
                      }}
                      onFinish={async (values) => {
                        const userId = userInfo?.userId;
                        if (userId == null || userId === "") {
                          window.$message?.error("未获取到用户信息");
                          return false;
                        }
                        await api.updateUser({
                          userId,
                          account: userInfo?.account,
                          nickName: values.nickName,
                          phone: values.phone,
                          email: values.email,
                          sex: values.sex,
                        });
                        await refreshUserInfo();
                        window.$message?.success("更新基本信息成功");
                        return true;
                      }}
                    >
                      <ProForm.Item
                        name="nickName"
                        label="用户昵称"
                        rules={[{ required: true, message: "请输入用户昵称" }]}
                        getValueFromEvent={getValueFromTtim}
                      >
                        <Input allowClear placeholder="用户昵称" />
                      </ProForm.Item>
                      <ProForm.Item
                        name="phone"
                        label="手机号码"
                        rules={[{ required: true, message: "请输入手机号码" }]}
                        getValueFromEvent={getValueFromTtim}
                      >
                        <Input allowClear placeholder="手机号码" />
                      </ProForm.Item>
                      <ProForm.Item
                        name="email"
                        label="邮箱"
                        rules={[
                          { required: true, message: "请输入邮箱" },
                          { type: "email", message: "邮箱格式不正确" },
                        ]}
                        getValueFromEvent={getValueFromTtim}
                      >
                        <Input allowClear placeholder="邮箱" />
                      </ProForm.Item>
                      <ProForm.Item
                        name="sex"
                        label="性别"
                        rules={[{ required: true, message: "请选择性别" }]}
                      >
                        <Radio.Group>
                          <Radio value="男">男</Radio>
                          <Radio value="女">女</Radio>
                        </Radio.Group>
                      </ProForm.Item>
                    </ProForm>
                  ),
                },
                {
                  key: "password",
                  label: "修改密码",
                  children: (
                    <ProForm
                      formRef={pwdFormRef}
                      layout="horizontal"
                      labelCol={{ flex: "100px" }}
                      wrapperCol={{ flex: 1 }}
                      requiredMark
                      submitter={{
                        searchConfig: {
                          submitText: "保存",
                        },
                        render: (_, dom) => (
                          <div className="mt-8 flex w-full justify-center">
                            <Space size="middle" className="flex-wrap justify-center">
                              {dom[1]}
                              <AntButton
                                onClick={() => pwdFormRef.current?.resetFields()}
                              >
                                关闭
                              </AntButton>
                            </Space>
                          </div>
                        ),
                      }}
                      onFinish={async (values) => {
                        const userId = userInfo?.userId;
                        if (userId == null || userId === "") {
                          window.$message?.error("未获取到用户信息");
                          return false;
                        }
                        await api.resetUserPassword({
                          userId,
                          password: values.newPassword,
                        });
                        pwdFormRef.current?.resetFields();
                        window.$message?.success("密码修改成功");
                        return true;
                      }}
                    >
                      <ProForm.Item
                        name="oldPassword"
                        label="旧密码"
                        rules={[{ required: true, message: "请输入旧密码" }]}
                        getValueFromEvent={getValueFromTtim}
                      >
                        <Input.Password placeholder="旧密码" />
                      </ProForm.Item>
                      <ProForm.Item
                        name="newPassword"
                        label="新密码"
                        getValueFromEvent={getValueFromTtim}
                        rules={[{ required: true, message: "请输入新密码" }, { min: 6, message: "至少 6 位" }]}
                      >
                        <Input.Password placeholder="新密码" />
                      </ProForm.Item>
                      <ProForm.Item
                        name="confirmPassword"
                        label="确认密码"
                        dependencies={["newPassword"]}
                        getValueFromEvent={getValueFromTtim}
                        rules={[
                          { required: true, message: "请再次输入新密码" },
                          ({ getFieldValue }: { getFieldValue: (field: string) => any }) => ({
                            validator(_: any, value: any) {
                              if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error("两次输入的密码不一致"));
                            },
                          }),
                        ]}
                      >
                        <Input.Password placeholder="确认新密码" />
                      </ProForm.Item>
                    </ProForm>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
      </ContentSection.Content>
    </ContentSection>
  );
}
