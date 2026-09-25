import React, { createContext, JSX, useContext, useMemo, useReducer } from "react";
const initalState = {
  visible: false,
  loading: false,
  submitLoading: false,
  title: "",
  id: "",
};
interface DictionaryState {
  visible?: boolean;
  loading?: boolean;
  submitLoading?: boolean;
  title: string;
  id?: string;
}
type RoleAction = ({ type: "OPEN_DICTIONARY" } & DictionaryState) | ({ type: "INIT" } & { loading: boolean }) | ({ type: "SUBMIT_LOADING" } & { submitLoading: boolean });
function roleReducer(state: DictionaryState, action: RoleAction) {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        loading: action.loading,
      };
    case "OPEN_DICTIONARY":
      return {
        ...state,
        visible: action.visible,
        id: action.id,
        title: action.title,
      };
    case "SUBMIT_LOADING":
      return {
        ...state,
        submitLoading: action.submitLoading,
      };
    default:
      return state;
  }
}
const createDictionaryContext = createContext<{ state: DictionaryState; dispatch: React.Dispatch<RoleAction> } | null>(null);
export function PermissionProvider({ children }: { children: JSX.Element }): JSX.Element {
  const [state, dispatch] = useReducer(roleReducer, initalState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <createDictionaryContext.Provider value={value}>{children}</createDictionaryContext.Provider>;
}
export const useDictionaryStore = () => {
  const context = useContext(createDictionaryContext);
  if (!context) {
    throw new Error("useRoleStore must be used within a PermissionProvider");
  }
  return context;
};
