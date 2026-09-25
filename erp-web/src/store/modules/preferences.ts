import { MIXED_NAVIGATION } from "@/hooks/use-layout/constants";
import { PreferencesState } from "@/interface";
import { createSlice } from "@reduxjs/toolkit";

/** 与 `PreferencesState` 一致的默认偏好设置，供 slice 与测试复用 */
export const initialState: PreferencesState = {
  /* ================== General ================== */
  watermark: false,
  watermarkContent: "erp",
  pageLayout: "layout-right",
  enableBackendAccess: true,
  enableFrontendAceess: false,
  language: "zh-CN",

  /* ================== Theme ================== */
  themeRadius: 6,
  themeColorPrimary: "#1677ff",

  /* ================== Animation ================== */
  transitionProgress: true,
  transitionLoading: true,
  transitionEnable: true,
  transitionName: "fade-slide",

  /* ================== Layout ================== */
  navigationStyle: MIXED_NAVIGATION,

  /* ================== Tabbar ================== */
  tabbarEnable: true,
  tabbarStyleType: "chrome",
  tabbarShowMore: true,

  /* ================== Sidebar ================== */
  sidebarEnable: true,
  sidebarWidth: 200,
  sidebarCollapsed: false,
  sidebarCollapseShowTitle: true,
  sidebarExtraCollapsedWidth: 48,
  sidebarTheme: "light",
  isSendRoutingRequest: true,
};
const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload
    },
    setNavigationStyle(state, action) {
      state.navigationStyle = action.payload
    },
    setPreferences(state, action) {
      Object.assign(state, action.payload);
    }
  },
});
export const { setSidebarCollapsed, setNavigationStyle, setPreferences } = preferencesSlice.actions
export default preferencesSlice.reducer;
