import logo from "@/assets/svg/logo.svg";

import { Typography } from "antd";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";

import { headerHeight } from "../../constants";
import React from "react";
import { navigateInTransition } from "@/utils/navigate-transition";

const { Title } = Typography;

export interface LogoProps {
  sidebarCollapsed: boolean
  className?: string
}

/**
 * @zh 高度 48px
 * @en The height is 48px
 */
export function Logo ({ sidebarCollapsed, className }: LogoProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{ height: headerHeight }}
      className={clsx("flex items-center justify-center gap-2 cursor-pointer", className)}
      onClick={() => navigateInTransition(navigate, import.meta.env.VITE_BASE_HOME_PATH)}
    >
      <img
        src={logo}
        alt="logo"
        width={32}
        height={32}
      />

      <Title
        level={1}
        className={clsx("text-sm m-0", { hidden: sidebarCollapsed })}
        ellipsis
      >
        {import.meta.env.VITE_GLOB_APP_TITLE}
      </Title>

    </div>
  );
}
