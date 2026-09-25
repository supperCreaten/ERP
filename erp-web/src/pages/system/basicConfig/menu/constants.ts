/** 菜单类型：0 目录 1 菜单 2 按钮 3 页面 */
export const MENU_TYPE = {
  DIRECTORY: "0",
  MENU: "1",
  BUTTON: "2",
  PAGE: "3",
} as const;

export type MenuTypeValue = (typeof MENU_TYPE)[keyof typeof MENU_TYPE];

export const MENU_TYPE_OPTIONS = [
  { label: "目录", value: MENU_TYPE.DIRECTORY },
  { label: "菜单", value: MENU_TYPE.MENU },
  { label: "按钮", value: MENU_TYPE.BUTTON },
  { label: "页面", value: MENU_TYPE.PAGE },
];

export const MENU_TYPE_LABEL: Record<string, string> = {
  [MENU_TYPE.DIRECTORY]: "目录",
  [MENU_TYPE.MENU]: "菜单",
  [MENU_TYPE.BUTTON]: "按钮",
  [MENU_TYPE.PAGE]: "页面",
};

/** 是否外链：与后端 UserConstants 一致，0=是 1=否 */
export const FRAME_OPTIONS = [
  { label: "是", value: "0" },
  { label: "否", value: "1" },
];

export const VISIBLE_OPTIONS = [
  { label: "显示", value: "0" },
  { label: "隐藏", value: "1" },
];

export const STATUS_OPTIONS = [
  { label: "正常", value: "0" },
  { label: "停用", value: "1" },
];

/** 表单 keepAlive：1=缓存 0=不缓存（对应后端 isCache 0/1 反向） */
export const KEEP_ALIVE_OPTIONS = [
  { label: "缓存", value: "1" },
  { label: "不缓存", value: "0" },
];

export const HALF_ROW_LABEL_COL = { span: 8 };
export const HALF_ROW_WRAPPER_COL = { span: 16 };
export const FULL_ROW_LABEL_COL = { span: 4 };
export const FULL_ROW_WRAPPER_COL = { span: 20 };

export function shouldShowIcon(menuType?: string) {
  return menuType === MENU_TYPE.DIRECTORY || menuType === MENU_TYPE.MENU
}

export function shouldShowRouteFields(menuType?: string) {
  return menuType !== MENU_TYPE.BUTTON;
}

export function shouldShowMenuDetailFields(menuType?: string) {
  return menuType === MENU_TYPE.MENU || menuType === MENU_TYPE.PAGE;
}
export function shouldShowFrameFields(menuType?: string) {
  return menuType === MENU_TYPE.MENU 
}
/** keepAlive(1缓存) → isCache('0'缓存) */
export function keepAliveToIsCache(keepAlive?: string) {
  return keepAlive === "1" ? "0" : "1";
}

/** isCache('0'缓存) → keepAlive('1'缓存) */
export function isCacheToKeepAlive(isCache?: string | number) {
  return isCache == null || isCache === "0" || isCache === 0 ? "1" : "0";
}
