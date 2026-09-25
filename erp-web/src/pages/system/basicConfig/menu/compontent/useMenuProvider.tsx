import React, { createContext, useContext, useMemo, useReducer } from "react";

export type MenuTreeNode = {
  menuId: string | number;
  menuName: string;
  children?: MenuTreeNode[];
};

export interface MenuModalState {
  visible: boolean;
  loading: boolean;
  addMenuLoading: boolean;
  title: string;
  menuId: string;
  treeData: MenuTreeNode[];
}

const initialState: MenuModalState = {
  visible: false,
  loading: false,
  addMenuLoading: false,
  title: "",
  menuId: "",
  treeData: [],
};

type MenuModalAction =
  | ({ type: "INIT" } & Partial<Pick<MenuModalState, "loading">>)
  | ({ type: "SET_TREE_DATA" } & Pick<MenuModalState, "treeData">)
  | ({ type: "OPEN_MENU" } & Partial<Pick<MenuModalState, "visible" | "title" | "menuId">>)
  | ({ type: "ADD_MENU" } & Partial<Pick<MenuModalState, "addMenuLoading">>);

function menuModalReducer(state: MenuModalState, action: MenuModalAction): MenuModalState {
  switch (action.type) {
    case "INIT":
      return { ...state, loading: !!action.loading };
    case "SET_TREE_DATA":
      return { ...state, treeData: action.treeData };
    case "OPEN_MENU":
      return {
        ...state,
        visible: action.visible ?? false,
        title: action.title ?? "",
        menuId: action.menuId !== undefined ? `${action.menuId}` : "",
      };
    case "ADD_MENU":
      return { ...state, addMenuLoading: !!action.addMenuLoading };
    default:
      return state;
  }
}

const MenuModalContext = createContext<{
  state: MenuModalState;
  dispatch: React.Dispatch<MenuModalAction>;
} | null>(null);

export function MenuModalProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(menuModalReducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <MenuModalContext.Provider value={value}>{children}</MenuModalContext.Provider>;
}

/** 菜单弹窗（新增 / 修改）状态，须在 MenuModalProvider 内使用 */
export function useMenuModalStore() {
  const ctx = useContext(MenuModalContext);
  if (!ctx) {
    throw new Error("useMenuModalStore 必须在 MenuModalProvider 内使用");
  }
  return ctx;
}

export const PermissionProvider = MenuModalProvider;
export const useMenuStore = useMenuModalStore;
