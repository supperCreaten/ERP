import { useDeviceType } from "@/hooks/use-device-type";
import {
  FIRST_COLUMN_WIDTH_IN_TWO_COLUMN_NAVIGATION,
  MIXED_NAVIGATION,
  SIDE_COLLAPSED_WIDTH,
  SIDE_NAVIGATION,
  SIDEBAR_WIDTH,
  TOP_NAVIGATION,
  TWO_COLUMN_NAVIGATION,
} from "./constants";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

/**
 * 获取当前页面的布局类型信息
 */
export function useLayout() {
  const { isMobile } = useDeviceType();
  const { navigationStyle, sidebarWidth } = useSelector((state: RootState) => state.preferences);

  const currentLayout = useMemo(() => (isMobile ? SIDE_NAVIGATION : navigationStyle), [isMobile, navigationStyle]);
  const isSideNav = useMemo(() => currentLayout === SIDE_NAVIGATION, [currentLayout]);
  const isTopNav = useMemo(() => currentLayout === TOP_NAVIGATION, [currentLayout]);
  const isTwoColumnNav = useMemo(() => currentLayout === TWO_COLUMN_NAVIGATION, [currentLayout]);
  const isMixedNav = useMemo(() => currentLayout === MIXED_NAVIGATION, [currentLayout]);

  return {
    currentLayout,
    isSideNav,
    isTopNav,
    isMixedNav,
    isTwoColumnNav,
    sidebarWidth: sidebarWidth || SIDEBAR_WIDTH,
    sideCollapsedWidth: SIDE_COLLAPSED_WIDTH,
    firstColumnWidthInTwoColumnNavigation: FIRST_COLUMN_WIDTH_IN_TWO_COLUMN_NAVIGATION,
  };
}
