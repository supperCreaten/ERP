import { useCallback, useMemo } from "react";
import { MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { MenuItemType } from "@/interface";
import { menuDaTa } from "@/store/modules/menu";
import { addMenuIcon, findDeepestFirstItem, findRootMenuByPath, getParentKeys } from "@/utils/menu";
import CreateComponent from "@/components/CreateComponent";
import { createIconifyIcon } from "@/icons";
import { navigateInTransition } from "@/utils/navigate-transition";
import { useLayout } from "../use-layout";
export default function useMenu() {
  const { wholeMenus } = useSelector(menuDaTa);
  const { pathname } = useLocation();
  const { isMixedNav, isTwoColumnNav } = useLayout();
  /**
   * 计算并缓存菜单的父级键值列表。
   * 当 wholeMenus 发生变化时，重新计算父级键值。
   */
  const menuParentKeys = useMemo(() => {
    return getParentKeys(wholeMenus);
  }, [wholeMenus]);
  /**
   * 根据当前路径获取选中的菜单键值列表。
   * 如果当前路径存在父级菜单，则返回父级菜单键值；否则返回包含当前路径的数组。
   *
   * @returns {string[]} 选中的菜单键值数组
   */
  const getSelectedKeys = useMemo(() => {
    const subMenu = menuParentKeys[pathname] ?? [];
    return [...subMenu, pathname];
  }, [menuParentKeys, pathname]);
  const navigate = useNavigate();
  /**
   * 混合菜单模式下需要拆分 menu 的 items
   */
  const shouldSplitMenuItems = useMemo(() => isMixedNav || isTwoColumnNav, [isMixedNav, isTwoColumnNav]);
  const addIconFromMenu = (data?: MenuItemType[] | null): MenuItemType[] => {
    if (!data?.length) return [];
    return addMenuIcon(data) ?? [];
  };
  /**
   * 混合导航模式下，侧边导航的顶级菜单 key
   */
  const sideNavMenuKeyInSplitMode = useMemo(() => {
    if (!shouldSplitMenuItems) return "";
    const { rootMenuPath } = findRootMenuByPath(wholeMenus, pathname);
    return rootMenuPath ?? "";
  }, [shouldSplitMenuItems, pathname, wholeMenus]);

  /* 混合菜单模式下需要拆分 menu 的 items */
  const splitSideNavItems = useMemo(() => {
    const foundMenu = wholeMenus?.find((item) => item?.key === sideNavMenuKeyInSplitMode);
    if (!foundMenu) {
      return [];
    }
    return addIconFromMenu(foundMenu?.children);
  }, [sideNavMenuKeyInSplitMode, wholeMenus]);
  /**
   * 头部菜单
   */
  const topNavItems = useMemo((): MenuItemType[] => {
    if (!shouldSplitMenuItems) return addIconFromMenu(wholeMenus);
    return (wholeMenus ?? []).map((v) => ({
      ...v,
      children: undefined,
      icon: CreateComponent(createIconifyIcon(`svg:${v.meta?.icon}`)),
    })) as MenuItemType[];
  }, [wholeMenus, shouldSplitMenuItems]);
  /**
   * 侧边菜单
   */
  const sideNavItems = useMemo(() => {
    if (!shouldSplitMenuItems) return addIconFromMenu(wholeMenus);
    return splitSideNavItems;
  }, [shouldSplitMenuItems, splitSideNavItems, wholeMenus]);
  /**
   * 菜单点击事件处理
   */
  const handleMenuSelect = useCallback(
    (key: string, mode: MenuProps["mode"]) => {
      /* 1. 非混合导航模式 2. 混合导航模式下的侧边导航 */
      if (!shouldSplitMenuItems || mode !== "horizontal") {
        if (/https?:/.test(key)) {
          window.open(key);
        } else {
          navigateInTransition(navigate, key);
        }
      } else {
        /* 混合导航模式下的顶部导航 */
        const rootMenu = wholeMenus.find((item) => item?.key === key);
        const targetMenu = findDeepestFirstItem(rootMenu?.children ?? []);
        /* 点击顶部的导航默认跳转到菜单下的第一个子项 */
        if (!targetMenu) {
          navigateInTransition(navigate, key);
        } else {
          navigateInTransition(navigate, targetMenu.key);
        }
      }
    },
    [navigate, shouldSplitMenuItems, wholeMenus],
  );
  return {
    topNavItems,
    sideNavItems,
    wholeMenus,
    getSelectedKeys,
    sideNavMenuKeyInSplitMode,
    handleMenuSelect,
  };
}
