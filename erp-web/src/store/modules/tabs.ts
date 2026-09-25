import type { TabPaneProps } from "antd";
import { createSlice } from "@reduxjs/toolkit";
// import { persist } from "zustand/middleware";

/**
 * @zh 标签页项目属性接口
 * @en Tab item properties interface.
 */
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

export interface TabStateType extends Omit<TabItemProps, "label"> {
  label: string;
  /**
   * @zh 标签页的新标题，用于修改标签页的标题
   * @en The new title of the tab, used to modify the title of the tab.
   */
  newTabTitle?: React.ReactNode;
}

const homePath = import.meta.env.VITE_BASE_HOME_PATH;

/** 默认首页标签（固定存在、不可关闭/拖拽） */
function createDefaultHomeTab (): TabStateType {
  return {
    key: homePath,
    label: "首页",
    closable: false,
    draggable: false,
  };
}

/** 保证首页标签存在且始终排在第一位 */
function ensureHomeInTabs (tabs: Map<string, TabStateType>): Map<string, TabStateType> {
  const homeTab: TabStateType = {
    ...createDefaultHomeTab(),
    ...tabs.get(homePath),
    closable: false,
    draggable: false,
    key: homePath,
  };
  const rest = Array.from(tabs.entries()).filter(([k]) => k !== homePath);
  return new Map([[homePath, homeTab], ...rest]);
}

/**
 * @zh 初始状态
 * @en Initial state.
 */
const initialState = {
  /**
   * @zh 标签页集合
   * @en Tab collection.
   */
  openTabs: ensureHomeInTabs(new Map()),
  /**
   * @zh 当前激活的标签页
   * @en The currently active tab.
   */
  activeKey: "",
  /**
   * @zh 标签页是否处于刷新状态
   * @en Whether it is in a refresh state.
   */
  isRefresh: false,
};

type TabsState = typeof initialState;

/**
 * @zh 标签页的操作方法
 * @en Tab operation methods.
 */
interface TabsAction {
  setIsRefresh: (state: boolean) => void;
  addTab: (routePath: string, tabProps: TabStateType) => void;
  insertBeforeTab: (routePath: string, tabProps: TabStateType) => void;
  removeTab: (routePath: string) => void;
  closeRightTabs: (routePath: string) => void;
  closeLeftTabs: (routePath: string) => void;
  closeOtherTabs: (routePath: string) => void;
  closeAllTabs: () => void;
  setActiveKey: (routePath: string) => void;
  resetTabs: () => void;
  changeTabOrder: (from: number, to: number) => void;
  setTableTitle: (routePath: string, title: string) => void;
  resetTableTitle: (routePath: string) => void;
}
/**
 * @zh 标签页状态管理
 * @en Tab state management.
 */
const tabSlice = createSlice({
  name: "tab",
  initialState,
  reducers: {
    setIsRefresh: (state, action) => {
      state.isRefresh = action.payload;
    },

    /**
     * @zh 设置标签页
     * @en Set the tab.
     */
    setActiveKey: (state, action) => {
      state.activeKey = action.payload;
    },

    /**
     * @zh 在最前面插入标签页
     * @en Insert a tab at the front.
     */
    insertBeforeTab: (state, action) => {
      const { key: routePath, ...tabProps } = action.payload;
      if (routePath) {
        const existing = state.openTabs.get(routePath);
        const tab: TabStateType = { ...existing, ...tabProps, key: routePath };
        const entries = Array.from(state.openTabs).filter(([k]) => k !== routePath);
        state.openTabs = ensureHomeInTabs(new Map([[routePath, tab], ...entries]));
      }
    },

    /**
     * @zh 添加标签页
     * @en Add a tab.
     */
    addTab: (state, action) => {
      const { key: routePath, ...tabProps } = action.payload;
      if (routePath) {
        const newTabs = new Map(state.openTabs);
        const merged: TabStateType = { ...newTabs.get(routePath), ...tabProps, key: routePath };
        if (routePath === homePath) {
          merged.closable = false;
          merged.draggable = false;
        }
        newTabs.set(routePath, merged);
        state.openTabs = ensureHomeInTabs(newTabs);
      }
    },

    /**
     * @zh 移除标签页
     * @en Remove a tab.
     */
    removeTab: (state, action) => {
      const routePath = action.payload;

      if (routePath === homePath) {
        return;
      }

      const newTabs = new Map(Array.from(state.openTabs));
      newTabs.delete(routePath);
      let newActiveKey = state.activeKey;

      if (routePath === state.activeKey) {
        const tabsArray = Array.from(ensureHomeInTabs(newTabs).keys());
        newActiveKey = tabsArray.at(-1) || homePath;
      }

      state.openTabs = ensureHomeInTabs(newTabs);
      state.activeKey = newActiveKey;
    },

    /**
     * @zh 关闭右侧标签页
     * @en Close tabs on the right.
     */
    closeRightTabs: (state, actions) => {
      const newTabs = new Map();
      const routePath = actions.payload;
      let found = false;
      let activeKeyFound = false;
      let newActiveKey = state.activeKey;

      for (const [key, value] of state.openTabs) {
        if (found) {
          break;
        }
        newTabs.set(key, value);
        if (key === routePath) {
          found = true;
        }
        if (key === state.activeKey) {
          activeKeyFound = true;
        }
      }

      if (!activeKeyFound) {
        newActiveKey = routePath;
      }
      state.openTabs = ensureHomeInTabs(newTabs);
      state.activeKey = newActiveKey;
    },

    /**
     * @zh 关闭左侧标签页
     * @en Close tabs on the left.
     */
    closeLeftTabs: (state, actions) => {
      const newTabs = new Map();
      const routePath = actions.payload;
      let found = false;
      let newActiveKey = state.activeKey;
      let activeKeyOnRight = false;

      for (const [key, value] of state.openTabs) {
        if (key === homePath) {
          continue;
        }

        if (found || key === routePath) {
          newTabs.set(key, value);
          found = true;
        }

        if (key === state.activeKey && found) {
          activeKeyOnRight = true;
        }
      }

      if (!activeKeyOnRight) {
        newActiveKey = routePath;
      }
      state.openTabs = ensureHomeInTabs(newTabs);
      state.activeKey = newActiveKey;
    },

    /**
     * @zh 关闭其他标签页
     * @en Close other tabs.
     */
    closeOtherTabs: (state, actions) => {
      const newTabs = new Map();
      const routePath = actions.payload;

      if (routePath !== homePath && state.openTabs.has(routePath)) {
        newTabs.set(routePath, state.openTabs.get(routePath)!);
      }

      let newActiveKey = state.activeKey;
      state.openTabs = ensureHomeInTabs(newTabs);
      if (!state.openTabs.has(newActiveKey)) {
        newActiveKey = routePath;
      }
      state.activeKey = newActiveKey;
    },

    /**
     * @zh 关闭所有标签页
     * @en Close all tabs.
     */
    closeAllTabs: (state) => {
      state.openTabs = ensureHomeInTabs(new Map());
      state.activeKey = homePath;
    },

    /**
     * @zh 更改标签页顺序
     * @en Change tab order.
     */
    changeTabOrder: (state, actions) => {
      const { from, to } = actions.payload;
      const newTabsArray = Array.from(state.openTabs.entries());
      if (newTabsArray[from]?.[0] === homePath || to === 0) {
        return;
      }
      const [movedTab] = newTabsArray.splice(from, 1);
      newTabsArray.splice(to, 0, movedTab);
      state.openTabs = ensureHomeInTabs(new Map(newTabsArray));
    },

    /**
     * @zh 设置标签页标题
     * @en Set the tab title
     */
    setTableTitle: (state, actions) => {
      const { routePath, title } = actions.payload;
      const newTabs = new Map(Array.from(state.openTabs));
      const targetTab = newTabs.get(routePath);
      if (targetTab) {
        targetTab.newTabTitle = title;
        newTabs.set(routePath, targetTab);
        state.openTabs = newTabs;
      }
    },

    /**
     * @zh 重置标签页标题（删除自定义的标题）
     * @en Reset the tab title (delete custom titles)
     */
    resetTableTitle: (state, actions) => {
      const routePath = actions.payload;
      const newTabs = new Map(Array.from(state.openTabs));
      const targetTab = newTabs.get(routePath);
      if (targetTab) {
        delete targetTab.newTabTitle;
        newTabs.set(routePath, targetTab);
        state.openTabs = newTabs;
      }
    },

    /**
     * @zh 重置所有标签页的状态
     * @en Reset all tab states
     */
    resetTabs: () => ({
      activeKey: "",
      isRefresh: false,
      openTabs: ensureHomeInTabs(new Map()),
    }),
  },
});
export const {
  setActiveKey,
  setIsRefresh,
  addTab,
  insertBeforeTab,
  removeTab,
  closeLeftTabs,
  closeRightTabs,
  closeOtherTabs,
  closeAllTabs,
  changeTabOrder,
  setTableTitle,
  resetTableTitle,
  resetTabs,
} = tabSlice.actions;
export default tabSlice.reducer;
