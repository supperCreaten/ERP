import { Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import AntButton from "@/components/BasicButton";
import BasicForm from "@/components/BasicForm";
import api from "@/api";
import { aesEncrypt, getValueFromTtim, showMessage } from "@/utils/methods";

interface ChangePasswordFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

type ChangePasswordValues = {
  account: string;
  password: string;
  confirmPassword: string;
};

const ChangePasswordForm = ({ onBack, onSuccess }: ChangePasswordFormProps) => {
  const [form] = BasicForm.useForm<ChangePasswordValues>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      setLoading(true);
      await api.changePassword({
        account: aesEncrypt(values.account),
        password: aesEncrypt(values.password),
      });
      showMessage("密码修改成功，账号已解锁，请使用新密码登录", "success");
      onSuccess?.();
    } catch {
      // 错误提示由 ajax 拦截器统一处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <BasicForm
      otherFormConfig={{
        form,
        className: "login-antd-form",
        layout: "horizontal",
        requiredMark: false,
        labelCol: { flex: "64px" },
        wrapperCol: { flex: 1 },
        colon: false,
        onFinish: onSubmit,
      }}
    >
      <BasicForm.Item
        label="账号"
        name="account"
        rules={[{ required: true, message: "请输入用户名" }]}
        getValueFromEvent={getValueFromTtim}
      >
        <Input
          className="login-field-input"
          prefix={<UserOutlined className="login-field-icon" />}
          placeholder="请输入用户名"
          autoComplete="username"
        />
      </BasicForm.Item>

      <BasicForm.Item
        label="新密码"
        name="password"
        rules={[
          { required: true, message: "请输入新密码" },
          { min: 6, message: "密码至少6位" },
        ]}
        getValueFromEvent={getValueFromTtim}
      >
        <Input.Password
          className="login-field-input"
          prefix={<LockOutlined className="login-field-icon" />}
          placeholder="请输入新密码（至少6位）"
          autoComplete="new-password"
        />
      </BasicForm.Item>

      <BasicForm.Item
        label="确认密码"
        name="confirmPassword"
        dependencies={["password"]}
        getValueFromEvent={getValueFromTtim}
        rules={[
          { required: true, message: "请再次输入新密码" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("两次输入的密码不一致"));
            },
          }),
        ]}
      >
        <Input.Password
          className="login-field-input"
          prefix={<LockOutlined className="login-field-icon" />}
          placeholder="请再次输入新密码"
          autoComplete="new-password"
        />
      </BasicForm.Item>

      <BasicForm.Item className="login-submit-item">
        <AntButton
          block
          htmlType="submit"
          type="primary"
          className="login-submit-btn"
          loading={loading}
          autoInsertSpace={false}
          title="提交"
        />
      </BasicForm.Item>

      <button type="button" className="mt-2! login-forgot-link login-forgot-link--center" onClick={onBack}>
        返回登录
      </button>
    </BasicForm>
  );
};

export default ChangePasswordForm;
