
import type { MenuProps } from "antd";
import {
  removeTab,
  closeLeftTabs,
  closeRightTabs,
  closeOtherTabs,
  closeAllTabs,
  setIsRefresh,
  TabStateType,
} from '@/store/modules/tabs'
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/utils/methods";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ReloadOutlined,
} from "@ant-design/icons";


import { TABBAR_HOME_PATH } from "../constants";

const homePath = TABBAR_HOME_PATH;
/**
 * 标签页操作的键值对象
 * @readonly
 * @enum {string}
 * @property {string} REFRESH - 重新加载当前标签页
 * @property {string} CLOSE - 关闭当前标签页
 * @property {string} CLOSE_RIGHT - 关闭右侧标签页
 * @property {string} CLOSE_LEFT - 关闭左侧标签页
 * @property {string} CLOSE_OTHERS - 关闭其他标签页
 * @property {string} CLOSE_ALL - 关闭所有标签页
 */
export const TabActionKeys = {
  REFRESH: "refresh",
  CLOSE: "close",
  CLOSE_RIGHT: "closeRight",
  CLOSE_LEFT: "closeLeft",
  CLOSE_OTHERS: "closeOthers",
  CLOSE_ALL: "closeAll",
} as const;

export type TabActionKey = typeof TabActionKeys[keyof typeof TabActionKeys];

/**
 * 自定义钩子，用于处理标签页的下拉菜单
 * @returns {[Function, Function]} 返回一个元组，包含菜单项生成函数和菜单点击处理函数
 */
export function useDropdownMenu () {
  const {
    openTabs,
    activeKey,
  } = useSelector((state: { tab: { openTabs: Map<string, TabStateType>; activeKey: string } }) => state.tab);
  const dispatch = useAppDispatch();
  /**
   * 生成菜单项
   * @param {string} tabKey - 当前标签页的键
   * @returns {MenuProps["items"]} 菜单项配置
   */
  const items = useCallback((tabKey: string): MenuProps["items"] => {
    const keys = Array.from(openTabs.keys());
    const idx = keys.indexOf(tabKey);
    const hasClosableLeft = idx > 0 && keys.slice(0, idx).some((k) => k !== homePath);
    const noLeftToClose = tabKey === homePath || !hasClosableLeft;
    const noRightToClose = idx < 0 || idx >= keys.length - 1;

    return [
      {
        key: TabActionKeys.REFRESH,
        icon: <ReloadOutlined />,
        label: "刷新页面",
        disabled: activeKey !== tabKey,
      },
      {
        key: TabActionKeys.CLOSE,
        icon: <CloseOutlined />,
        label: "关闭当前",
        disabled: tabKey === homePath,
      },
      {
        key: TabActionKeys.CLOSE_OTHERS,
        icon: <CloseCircleOutlined />,
        label: "关闭其他",
        disabled: tabKey === homePath || openTabs.size <= 2,
      },
      {
        key: TabActionKeys.CLOSE_LEFT,
        icon: <ArrowLeftOutlined />,
        label: "关闭左侧",
        disabled: tabKey === homePath || noLeftToClose,
      },
      {
        key: TabActionKeys.CLOSE_RIGHT,
        icon: <ArrowRightOutlined />,
        label: "关闭右侧",
        disabled: tabKey === homePath || noRightToClose,
      },
      {
        key: TabActionKeys.CLOSE_ALL,
        icon: <CloseCircleOutlined />,
        label: "全部关闭",
        disabled: openTabs.size <= 1,
      },
    ];
  }, [activeKey, homePath, openTabs]);

  /**
   * 定义菜单操作与对应的处理函数
   */
  const actions = useMemo(() => ({
    [TabActionKeys.REFRESH]: () => {
      // 实际刷新在 LayoutContent 内通过 aliveRef 执行（Tabbar 不在 KeepAlive 子树，无 context）
      dispatch(setIsRefresh(true));
    },
    [TabActionKeys.CLOSE]: (tabKey: string) => {
      dispatch(removeTab(tabKey));
    },
    [TabActionKeys.CLOSE_RIGHT]: (tabKey: string) => {
      dispatch(closeRightTabs(tabKey));
    },
    [TabActionKeys.CLOSE_LEFT]: (tabKey: string) => {
      dispatch(closeLeftTabs(tabKey));
    },
    [TabActionKeys.CLOSE_OTHERS]: (tabKey: string) => {
      dispatch(closeOtherTabs(tabKey));
    },
    [TabActionKeys.CLOSE_ALL]: () => {
      dispatch(closeAllTabs());
    },
  }), [dispatch]);

  /**
   * 处理菜单点击事件
   * @param {string} menuKey - 被点击的菜单项键
   * @param {string} nodeKey - 当前标签页的键
   */
  const onClickMenu = useCallback((menuKey: string, nodeKey: string) => {
    const action = actions[menuKey as keyof typeof actions];
    if (action) {
      action(nodeKey);
    }
  }, [actions]);

  return [items, onClickMenu] as const;
}
