import { Input } from "antd"
import { LockOutlined, UserOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { setAccessToken } from "@/utils/auth"
import { useState } from "react"
import AntButton from "@/components/BasicButton"
import BasicForm from "@/components/BasicForm"
import api from "@/api"
import { aesEncrypt, getValueFromTtim, showMessage } from "@/utils/methods"
import { navigateInTransition } from "@/utils/navigate-transition"
import { unwrapDataWith } from "@/utils/apiResponse"

type LoginFormValues = {
  account: string
  password: string
}

const getErrorMessage = (error: unknown): string => {
  const msg = (error as { msg?: string | string[] })?.msg
  if (Array.isArray(msg)) return msg.join("")
  if (msg) return msg
  return ""
}

const isAccountLockedMessage = (message: string): boolean => message.includes("锁定")

const LoginForm = ({ onForgotPassword }: { onForgotPassword?: () => void }) => {
  const next = useNavigate()
  const [form] = BasicForm.useForm<LoginFormValues>()
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [lockedMessage, setLockedMessage] = useState("")

  const handleAuthError = (message: string) => {
    if (message.includes("账号不存在")) {
      setLocked(false)
      return
    }
    if (isAccountLockedMessage(message)) {
      setLockedMessage(message)
      setLocked(true)
    }
  }

  const onFinish = async (values: LoginFormValues) => {
    if (locked) {
      showMessage(lockedMessage, "warning")
      return
    }
    try {
      setLoading(true)
      const response = await api.login({
        account: aesEncrypt(values.account),
        password: aesEncrypt(values.password),
      })
      const accessToken = unwrapDataWith(response, "")
      setAccessToken(accessToken)
      localStorage.removeItem("ec:login-remember")
      setLocked(false)
      setLockedMessage("")
      navigateInTransition(next, import.meta.env.VITE_BASE_HOME_PATH)
    } catch (error: unknown) {
      handleAuthError(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <BasicForm
      otherFormConfig={{
        form,
        className: "login-antd-form",
        layout: "horizontal",
        requiredMark: false,
        labelCol: { flex: "50px" },
        wrapperCol: { flex: 1 },
        colon: false,
        onFinish,
      }}
    >
      <BasicForm.Item
        label="账号："
        name="account"
        rules={[{ required: true, message: "请输入用户名" }]}
        getValueFromEvent={getValueFromTtim}
      >
        <Input
          className="login-field-input"
          prefix={<UserOutlined className="login-field-icon" />}
          placeholder="请输入账号"
          disabled={locked}
          maxLength={20}
          autoComplete="username"
        />
      </BasicForm.Item>

      <BasicForm.Item
        label="密码："
        name="password"
        rules={[{ required: true, message: "请输入密码" }]}
        getValueFromEvent={getValueFromTtim}
      >
        <Input.Password
          className="login-field-input"
          prefix={<LockOutlined className="login-field-icon" />}
          placeholder="请输入密码"
          disabled={locked}
          autoComplete="current-password"
        />
      </BasicForm.Item>

      <div className="login-extra">
        <button type="button" className="login-forgot-link" onClick={onForgotPassword}>
          忘记密码?
        </button>
      </div>

      <BasicForm.Item className="login-submit-item mb-0!">
        <AntButton
          block
          htmlType="submit"
          type="primary"
          className="login-submit-btn"
          loading={loading}
          disabled={locked}
          autoInsertSpace={false}
          title="登 录"
        />
      </BasicForm.Item>
    </BasicForm>
  )
}

export default LoginForm
