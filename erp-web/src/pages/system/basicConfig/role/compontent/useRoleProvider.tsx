import type { BasicDataNode } from "antd/lib/tree";
import React, { createContext, JSX, Key, ReactNode, useContext, useMemo, useReducer } from "react";

/** 菜单列表接口字段，与 Tree 的 fieldNames.key/title 对应 menuId/menuName */
export interface RoleMenuTreeNode extends BasicDataNode {
  menuId: Key
  menuName?: ReactNode
  children?: RoleMenuTreeNode[]
}

const initalState = {
  visible: false,
  permissionVisible: false,
  treeLoading: false,
  loading: false,
  addRoleLoading: false,
  menuCofirmloading: false,
  userCofirmloading: false,
  title: "",
  roleId: "",
  roleName: "",
  treeData: [] as RoleMenuTreeNode[],
  selectedUserKeys: [],
  selectedMenuKeys: [],
};
interface RoleState {
  visible?: boolean;
  permissionVisible?: boolean;
  treeLoading?: boolean;
  addRoleLoading?: boolean;
  loading?: boolean;
  menuCofirmloading?: boolean;
  userCofirmloading?: boolean;
  title?: string;
  roleId?: string;
  roleName?: string;
  treeData?: RoleMenuTreeNode[];
  selectedUserKeys?: Key[];
  selectedMenuKeys?: Key[];
}
type RoleAction =
  | ({ type: "OPEN_ROLE" } & RoleState)
  | ({ type: "ADD_ROLE_LOADING" } & RoleState)
  | ({ type: "PERMISSION" } & RoleState)
  | ({ type: "SET_SELECTED_MENU_KEYS" } & RoleState)
  | ({ type: "SET_SELECTED_USER_KEYS" } & RoleState)
  | ({ type: "INIT" } & RoleState)
  | ({ type: "SET_TREE_DATA" } & RoleState)
  | ({ type: "SUBMIT_USER_LOADING" } & RoleState)
  | ({ type: "SUBMIT_MENU_LOADING" } & RoleState);
function roleReducer(state: RoleState, action: RoleAction) {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        loading: action.loading,
      };
    case "SET_TREE_DATA":
      return {
        ...state,
        treeData: action.treeData,
      };
    case "OPEN_ROLE":
      return {
        ...state,
        visible: action.visible,
        roleId: action.roleId,
        title: action.title,
      };
    case "ADD_ROLE_LOADING":
      return {
        ...state,
        addRoleLoading: action.addRoleLoading,
      };
    case "PERMISSION":
      return {
        ...state,
        permissionVisible: action.permissionVisible,
        roleId: action.roleId,
        roleName: action.roleName ?? state.roleName,
      };
    case "SET_SELECTED_MENU_KEYS":
      return {
        ...state,
        selectedMenuKeys: action.selectedMenuKeys,
      };
    case "SET_SELECTED_USER_KEYS":
      return {
        ...state,
        selectedUserKeys: action.selectedUserKeys,
      };
    case "SUBMIT_USER_LOADING":
      return {
        ...state,
        userCofirmloading: action.userCofirmloading,
      };
    case "SUBMIT_MENU_LOADING":
      return {
        ...state,
        menuCofirmloading: action.menuCofirmloading,
      };
    default:
      return state;
  }
}
const createRoleContext = createContext<{ state: RoleState; dispatch: React.Dispatch<RoleAction> } | null>(null);
export function PermissionProvider({ children }: { children: JSX.Element }): JSX.Element {
  const [state, dispatch] = useReducer(roleReducer, initalState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <createRoleContext.Provider value={value}>{children}</createRoleContext.Provider>;
}
export const useRoleStore = () => {
  const context = useContext(createRoleContext);
  if (!context) {
    throw new Error("useRoleStore must be used within a RoleProvider");
  }
  return context;
};
