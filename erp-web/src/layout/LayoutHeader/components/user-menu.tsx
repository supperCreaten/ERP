import type { ButtonProps, MenuProps } from "antd";

import AntButton from "@/components/BasicButton";
import { cn, useAppDispatch } from "@/utils/methods";
import { navigateInTransition } from "@/utils/navigate-transition";
import { resolvePublicUrl } from "@/utils/publicUrl";
import { isWindowsOs } from "@/utils/is-windows-os";
import { useKeyPress } from "ahooks";
import { Avatar, Dropdown, Modal } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { userLogout } from "@/store/modules/user";
import createComponent from "@/components/CreateComponent";
import { createIconifyIcon } from "@/icons";
import { LogoutOutlined } from "@ant-design/icons";
export function UserMenu({ ...restProps }: ButtonProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [modal, contextHolder] = Modal.useModal();
  // const { t } = useTranslation();
  const userInfo = useSelector((state: { user: { userInfo?: Record<string, unknown> } }) => state.user.userInfo || {});
  const avatarSrc = useMemo(() => {
    const raw = userInfo.avatar as string | undefined;
    return resolvePublicUrl(raw) || "https://avatar.vercel.sh/user.svg";
  }, [userInfo.avatar]);

  const displayName = useMemo(
    () => (userInfo.nickName as string) || (userInfo.userName as string) || (userInfo.account as string) || "用户",
    [userInfo.nickName, userInfo.userName, userInfo.account],
  );
  const handleMenuKey = async (key: string) => {
    if (key === "logout") {
      const confirmed = await modal.confirm({ title: "退出登录", content: "确定要退出登录？" ,cancelText:'取消',okText:'确定'});
      confirmed && dispatch(userLogout());
    }
    if (key === "personal-center") {
      navigateInTransition(navigate, "/personal-center/my-profile");
    }
  };

  const onClick: MenuProps["onClick"] = async ({ key }) => {
    await handleMenuKey(`${key}`);
  };

  const altView = useMemo(() => (isWindowsOs() ? "Alt" : "⌥"), [isWindowsOs]);
  const items: MenuProps["items"] = [
    {
      label: "个人中心",
      key: "personal-center",
      icon: createComponent(createIconifyIcon("svg:personal-center")),
      extra: `${altView}P`,
    },
    {
      label: "退出登录",
      key: "logout",
      icon: <LogoutOutlined />,
      extra: `${altView}Q`,
    },
  ];

  useKeyPress(["alt.P"], () => {
    navigateInTransition(navigate, "/personal-center/my-profile");
  });

  useKeyPress(["alt.Q"], () => {
    void handleMenuKey("logout");
  });

  return (
    <>
      {contextHolder}
      <Dropdown
        menu={{ items, onClick }}
        arrow={false}
        placement="bottomRight"
        trigger={["click"]}
        destroyOnHidden
      >
        <AntButton
          type="text"
          {...restProps}
          className={cn(
            restProps.className,
            "inline-flex h-auto max-w-50 items-center gap-2 rounded-full px-2 py-1",
          )}
        >
          <span
            className="max-w-30 truncate text-sm font-medium leading-none text-inherit"
            title={displayName}
          >
            {displayName}
          </span>
          <Avatar src={avatarSrc} size={32} />
        </AntButton>
      </Dropdown>
    </>
  );
}
