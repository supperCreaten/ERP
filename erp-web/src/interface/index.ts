import { MIXED_NAVIGATION, SIDE_NAVIGATION, TOP_NAVIGATION, TWO_COLUMN_NAVIGATION } from "@/hooks/use-layout/constants";
import store from "@/store";
import { ProTableProps } from "@ant-design/pro-components";
import { FormInstance, FormItemProps, MenuProps, TabPaneProps } from "antd";
import { ScreenSizeMap } from "antd/es/_util/responsiveObserver";
import { ComponentType, JSX, LazyExoticComponent, ReactNode } from "react";
import { IndexRouteObject, NonIndexRouteObject } from "react-router-dom";
import { Dispatch } from "redux";
export interface MenuInfo {
  path: string;
  component: string;
  hidden: boolean;
  menuId: string;
  menuType: number;
  meta: {
    title: string;
    icon: string;
    keepAlive?: boolean | number;
  };
  parentId: number;
  children?: MenuInfo[] | null;
}
export type MenuItemType = Required<MenuProps>["items"][number] & {
  key: string;
  path: string;
  component: string;
  level: number;
  hidden: boolean;
  meta: {
    title: string;
    icon: string;
    keepAlive?: boolean | number;
  };
  children: MenuItemType[] | undefined;
};

export interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}
export interface FormConfig {
  colProps?: ScreenSizeMap;
  component: JSX.Element;
  /** field：标准 Form.Item 字段；slot：直接渲染 component（需自行包含 Form.Item 等） */
  type?: "field" | "slot";
  formItemProps?: FormItemProps & { type?: "text" };
  key?: string;
}

export interface FormSectionConfig {
  title?: string;
  variant?: "default" | "shipper" | "receiver";
  className?: string;
  gutter?: number | [number, number];
  formConfig?: FormConfig[];
  children?: ReactNode;
  /** 为 true 时先渲染 children，再渲染 formConfig（如货物表格在费用字段之前） */
  childrenFirst?: boolean;
  /** formConfig 行外层包裹类名 */
  formConfigClassName?: string;
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DispatchAction = Dispatch<{ type: string; data?: any }>;
export type FormRef<Values = any> = FormInstance<Values> & {
  nativeElement?: HTMLFormElement;
};
export interface TabItem {
  label: string;
  path: string;
  closable: boolean;
}
export interface TagItem {
  title: string;
  key: string;
}
export type AppDispatch = typeof store.dispatch;
export interface MenuInitialState {
  wholeMenus: MenuItemType[];
  isAccessChecked: boolean;
}
export interface SiderMenu {
  label: string;
  path: string;
  icon: string;
  children: SiderMenu[] | undefined;
}
export interface RouteMeta {
  /**
   * 路由标题，通常用于页面标题或者侧边栏菜单显示
   */
  title: ReactNode;

  /**
   * 菜单图标，用于侧边栏菜单项的图标显示
   */
  icon?: ReactNode;

  /**
   * 菜单排序，用于控制侧边栏菜单的显示顺序
   */
  order?: number;

  /**
   * 用于配置页面的权限，只有拥有对应权限的用户才能访问页面，不配置则不需要权限。
   */
  roles?: string[];

  /**
   * 页面内按钮级别的权限，用于控制页面内按钮的显示和隐藏
   */
  permissions?: string[];

  /**
   * 设置页面是否开启缓存，开启后页面会缓存，不会重新加载，仅在标签页启用时有效。
   * @default true
   */
  keepAlive?: boolean | number;

  /**
   * 是否在菜单中隐藏，用于控制某些路由不在侧边栏菜单中显示
   */
  hideInMenu?: boolean;

  /**
   * iframe链接，如果路由需要在iframe中加载外部页面时使用
   */
  iframeLink?: string;

  /**
   * 外部链接，点击后直接在新标签页中打开
   */
  externalLink?: string;

  /**
   * 用于配置页面是否忽略权限，直接可以访问
   */
  ignoreAccess?: boolean;

  /**
   * @description 指定当前激活的菜单，适用于动态路由情景下激活父菜单
   * @example 从父路由 '/user/info' 导航到子路由 '/user/info/1' 时，可以手动手动指定以高亮显示父菜单 '/user/info'
   */
  currentActiveMenu?: string;

  /**
   * 当前路由为请求后端接口得到的
   */
  backstage?: boolean;
}
export interface IndexRouteMeta extends Omit<IndexRouteObject, "id" | "Component"> {
  handle: RouteMeta;
  component: string;
}
export interface NonIndexRouteMeta extends Omit<NonIndexRouteObject, "id" | "Component"> {
  handle: RouteMeta;
  component: string;
  children?: AppRouteRecordRaw[];
}
export type AppRouteRecordRaw = IndexRouteMeta | NonIndexRouteMeta;
export interface LayoutMenuProps {
  mode?: MenuProps["mode"];
  /**
   * 控制是否自动展开当前路由对应的菜单项
   *
   * Why?
   * 注意：当菜单模式为顶部导航模式，菜单 mode 为 horizontal，初次进入页面时，菜单不应自动展开，可以指定 autoExpandCurrentMenu 为 false 关闭自动展开功能
   * @see https://github.com/user-attachments/assets/705ae01d-db7f-4f42-b4dd-66adba0dd68f
   */
  autoExpandCurrentMenu?: boolean;
  menus?: MenuItemType[];
  handleMenuSelect?: (key: string, mode: MenuProps["mode"]) => void;
}
/**
 * @zh 登录页面布局
 * @en Login page layout
 */
export type PageLayoutType = "layout-left" | "layout-center" | "layout-right";

export type LanguageType = "zh-CN" | "en-US";
/**
 * @zh 动画类型
 * @en Animation type
 */
interface AnimationState {
  /**
   * @zh 是否启用过渡动画
   * @en Whether to enable transition animation
   * @default true
   */
  transitionProgress: boolean;
  /**
   * @zh 是否启用加载动画
   * @en Whether to enable loading animation
   * @default true
   */
  transitionLoading: boolean;
  /**
   * @zh 是否启用动画
   * @en Whether to enable animation
   * @default true
   */
  transitionEnable: boolean;
  /**
   * @zh 过渡动画名称
   * @en Transition animation name
   * @default "fade-slide"
   */
  transitionName: string;
}
interface LayoutState {
  navigationStyle: NavigationType;
}

export interface GeneralState {
  /**
   * @zh 是否开启水印
   * @en Whether to enable watermark
   * @default false
   */
  watermark: boolean;
  /**
   * @zh 水印内容
   * @en Watermark content
   * @default ""
   */
  watermarkContent: string;
  /**
   * @zh 登录页面的布局配置
   * @en Login page layout configuration
   * @default "layout-right"
   */
  pageLayout: PageLayoutType;
  /**
   * @zh 开启前端路由权限
   * @en Enable frontend route permissions
   * @default false
   */
  enableFrontendAceess: boolean;
  /**
   * @zh 开启后端路由权限
   * @en Enable backend route permissions
   * @default true
   */
  enableBackendAccess: boolean;

  /**
   * @zh 当前语言
   * @en Current language
   * @default "zh-CN"
   */
  language: LanguageType;
}

export interface SidebarState {
  /**
   * 侧边栏是否可见
   * @default true
   */
  sidebarEnable?: boolean;
  /**
   * 侧边菜单展开宽度（支持交界处拖拽调整）
   * @default 200
   */
  sidebarWidth: number;
  /**
   * 侧边菜单折叠状态
   * @default false
   */
  sidebarCollapsed: boolean;
  /**
   * 侧边菜单是否折叠时，是否显示 title
   * @default true
   */
  sidebarCollapseShowTitle: boolean;
  /**
   * 侧边菜单折叠额外宽度
   * @default 48
   */
  sidebarExtraCollapsedWidth: number;
  /**
   * 侧边栏主题
   * @default dark
   */
  sidebarTheme: MenuProps["theme"];
}
/**
 * @zh 标签栏风格
 * @en Tabbar style
 */
export type TabsStyleType = "brisk" | "card" | "chrome" | "plain";
/**
 * @zh 导航类型
 */
export type NavigationType = typeof SIDE_NAVIGATION | typeof TOP_NAVIGATION | typeof TWO_COLUMN_NAVIGATION | typeof MIXED_NAVIGATION;
export interface PreferencesState extends AnimationState, LayoutState, GeneralState, SidebarState {
  /* ================== Theme ================== */
  /**
   * @zh 主题圆角值
   * @default 6
   */
  themeRadius: number;
  /**
   * @zh 主题色
   * @default "#1677ff"
   */
  themeColorPrimary: string;
  /* ================== Theme ================== */

  /* ================== Tabbar ================== */
  /**
   * @zh 标签栏风格
   * @en Tabbar style
   * @default "chrome"
   */
  tabbarStyleType: TabsStyleType;
  /**
   * @zh 是否启用标签栏
   * @en Whether to enable tabbar
   * @default true
   */
  tabbarEnable: boolean;
  /**
   * @zh 是否显示更多
   * @en Whether to show more
   * @default true
   */
  tabbarShowMore: boolean;
  /**
   * 开启后端获取路由的情况下，是否发送路由请求获取路由数据
   *
   * 如果设置为 false，则不会单独发送一个请求获取路由数据，而是从用户详情接口中获取动态路由数据
   * 如果设置为 true，则会单独发送一个请求获取路由数据
   */
  isSendRoutingRequest: boolean;
  /* ================== Tabbar ================== */
}
export interface BasicTableProps<D, U, V> extends ProTableProps<D, U, V> {
  /**
   * @description 自适应内容区高度，如果设置了 scroll.y，则不进行自适应
   * @default false
   */
  adaptive?:
    | boolean
    | {
        /** 表格距离页面底部的偏移量，默认值为 `16` */
        offsetBottom?: number;
      };
}
export interface TabItemProps extends Omit<TabPaneProps, "tab"> {
  key: string;
  label: React.ReactNode;
  /**
   * @zh 是否可拖拽
   * @en Whether it can be dragged.
   */
  draggable?: boolean;
  /**
   * 可选的历史状态值，如 search 和 hash，可存储于此
   * 在目标路由中可通过 useLocation 钩子访问该状态
   * @see {@link https://reactrouter.com/en/main/hooks/use-navigate#optionsstate | usenavigate - options state}
   */
  historyState?: Record<string, any>;
}
