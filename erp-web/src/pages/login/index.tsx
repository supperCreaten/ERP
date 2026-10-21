import { useState } from "react";
import { ConfigProvider } from "antd";
import { cn } from "@/utils/methods";
import LoginForm from "./loginForm";
import ChangePasswordForm from "./changePasswordForm";
import loginFactoryBg from "@/assets/images/login_factory_bg.png";
import brandLogo from "@/assets/svg/logo.svg";
import { buildAntdThemeConfig } from "@/styles/theme/build-antd-theme";

type LoginView = "login" | "changePassword";

const LOGIN_THEME = buildAntdThemeConfig({
  themeColorPrimary: "#1677ff",
  themeRadius: 6,
});

export default function LoginPage() {
  const [view, setView] = useState<LoginView>("login");
  const [loginFormKey, setLoginFormKey] = useState(0);
  const isFlipped = view === "changePassword";

  const handlePasswordChanged = () => {
    setLoginFormKey((key) => key + 1);
    setView("login");
  };

  return (
    <ConfigProvider theme={LOGIN_THEME}>
      <div className="login-page">
        <div className="login-page__bg" aria-hidden>
          <img
            className="login-page__photo"
            src={loginFactoryBg}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
          <span className="login-page__veil" />
          <span className="login-page__vignette" />
        </div>

        <div className="login-stage">
          <header className="login-system mb-3!">
            <div className="login-system__logo" aria-hidden>
              <img src={brandLogo} alt="" width={48} height={48} />
            </div>
            <div className="login-system__text">
              <h1 className="login-system__name">ERP 生产管理系统</h1>
              <p className="login-system__en">Enterprise Resource Planning</p>
            </div>
          </header>

          <div className={cn("login-card-flip", isFlipped && "is-flipped")}>
            <div className="login-card-flip__inner">
              <section className="login-card login-card-flip__face login-card-flip__face--front">
                <div className="login-card__head">
                  <h2 className="login-card__title">欢迎登录</h2>
                </div>
                <LoginForm key={loginFormKey} onForgotPassword={() => setView("changePassword")} />
              </section>

              <section className="login-card login-card-flip__face login-card-flip__face--back">
                <div className="login-card__head">
                  <h2 className="login-card__title">修改密码</h2>
                  <p className="login-card__desc">修改完成后请使用新密码登录</p>
                </div>
                <ChangePasswordForm onBack={() => setView("login")} onSuccess={handlePasswordChanged} />
              </section>
            </div>
          </div>

          <footer className="login-foot">
            <span>销售</span>
            <i />
            <span>计划</span>
            <i />
            <span>采购</span>
            <i />
            <span>生产</span>
            <i />
            <span>仓储</span>
            <i />
            <span>财务</span>
          </footer>
        </div>
      </div>
    </ConfigProvider>
  );
}
