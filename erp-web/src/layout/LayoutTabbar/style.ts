import { createUseStyles } from "react-jss";

export const useStyles = createUseStyles(({ token }: { token: any }) => {
  return {
    tabsContainer: {
      backgroundColor: token.colorBgContainer,
      borderTop: `1px solid ${token.colorBorderSecondary}`,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
    resetTabs: {
      "& .ant-tabs-nav::before": {
        display: "none",
      },
      "& .ant-tabs-nav": {
        margin: 0,
        padding: "4px 8px",
        "& .ant-tabs-tab": {
          // antd 自带的动画和 DND 动画冲突
          transition: "inherit",
          marginLeft: "0px !important",
          border: "none !important",
          borderRadius: "0px !important",
          padding: "6px 14px !important",
          display: "inline-flex !important",
          alignItems: "center !important",
          fontSize: 13,
          lineHeight: "20px",
          color: token.colorTextSecondary,
        },
        "& .ant-tabs-tab-btn": {
          display: "inline-flex !important",
          alignItems: "center !important",
          lineHeight: "20px",
          textShadow: "none !important",
        },
        "& .ant-tabs-tab-active": {
          color: `${token.colorPrimary} !important`,
          "& .ant-tabs-tab-btn": {
            fontWeight: 500,
            textShadow: "none !important",
          },
        },
        "& .ant-tabs-tab-remove": {
          display: "inline-flex !important",
          alignItems: "center !important",
          justifyContent: "center",
          margin: "0 0 0 6px !important",
          width: 16,
          height: 16,
          borderRadius: "50%",
          fontSize: 10,
          color: token.colorTextQuaternary,
          transition: "color 0.15s ease, background-color 0.15s ease",
          "&:hover": {
            color: token.colorTextSecondary,
            backgroundColor: token.colorFillSecondary,
          },
        },
      },
    },
    brisk: {
      "& .ant-tabs-nav": {
        "& .ant-tabs-tab": {
          borderRight: `1px solid ${token.colorBorderSecondary} !important`,
          "&:hover": {
            color: token.colorText,
            backgroundColor: token.colorFillQuaternary,
          },
        },
      },
      "& .ant-tabs-ink-bar": {
        backgroundColor: token.colorPrimary,
        height: "2px !important",
        visibility: "visible !important",
      },
    },
    plain: {
      "& .ant-tabs-nav": {
        "& .ant-tabs-tab": {
          borderRight: `1px solid ${token.colorBorderSecondary} !important`,
          "&:hover": {
            color: token.colorText,
            backgroundColor: token.colorFillQuaternary,
          },
        },
        "& .ant-tabs-tab-active": {
          backgroundColor: `${token.colorPrimaryBg} !important`,
        },
      },
    },
    chrome: {
      "& .ant-tabs-nav": {
        padding: "5px 8px 0",
        "& .ant-tabs-nav-list": {
          gap: 4,
        },
        "& .ant-tabs-tab:not(.ant-tabs-tab-active)": {
          backgroundColor: token.colorFillQuaternary,
          position: "relative",
          borderRadius: "8px 8px 0 0 !important",
          padding: "6px 14px !important",
          marginBottom: 3,
          "&:hover": {
            backgroundColor: token.colorFillTertiary,
            color: token.colorText,
          },
          "&:hover::after": {
            display: "none",
          },
          "&::after": {
            content: "' '",
            position: "absolute",
            right: -3,
            top: "50%",
            transform: "translateY(-50%)",
            width: 1,
            height: 14,
            backgroundColor: token.colorBorderSecondary,
          },
        },
        "& .ant-tabs-tab-active": {
          padding: "6px 14px 9px !important",
          backgroundColor: `${token.colorPrimaryBg} !important`,
          borderTopLeftRadius: "8px !important",
          borderTopRightRadius: "8px !important",
          position: "relative",
          "&::before": {
            content: "' '",
            position: "absolute",
            left: -8,
            bottom: 0,
            width: 8,
            height: 8,
            backgroundColor: token.colorPrimaryBg,
            transform: "rotate(-90deg)",
            zIndex: 1,
            clipPath: "path('M 0 0 A 8 8 0 0 0 8 8 L 0 8 Z')",
          },
          "&::after": {
            content: "' '",
            position: "absolute",
            right: -8,
            bottom: 0,
            width: 8,
            height: 8,
            zIndex: 1,
            backgroundColor: token.colorPrimaryBg,
            clipPath: "path('M 0 0 A 8 8 0 0 0 8 8 L 0 8 Z')",
          },
        },
      },
    },
    /** 标签右键菜单：白底、细边框、阴影，与后台标签栏一致 */
    tabBarContextMenu: {
      "&.ant-dropdown-menu": {
        minWidth: 118,
        padding: "4px 2px",
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
      },
      "& .ant-dropdown-menu-item": {
        padding: "6px 10px !important",
        borderRadius: token.borderRadiusSM,
        gap: 8,
      },
      "& .ant-dropdown-menu-item-icon": {
        fontSize: 14,
      },
    },
    card: {
      "& .ant-tabs-nav": {
        "& .ant-tabs-nav-list": {
          gap: 6,
        },
        "& .ant-tabs-tab": {
          backgroundColor: token.colorFillQuaternary,
          border: `1px solid ${token.colorBorderSecondary} !important`,
          position: "relative",
          borderRadius: "6px !important",
          padding: "5px 12px !important",
          marginBottom: 2,
          "&:hover": {
            backgroundColor: token.colorFillTertiary,
            color: token.colorText,
          },
        },
        "& .ant-tabs-tab-active": {
          backgroundColor: `${token.colorPrimaryBg} !important`,
          borderColor: `${token.colorPrimaryBorder} !important`,
          color: `${token.colorPrimary} !important`,
        },
      },
    },
  };
});
