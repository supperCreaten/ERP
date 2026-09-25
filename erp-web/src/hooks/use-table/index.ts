import { AnyObject } from "antd/es/_util/type";
import { useReducer } from "react";

export interface TableState {
  pageSize: number;
  currentPage: number;
  total: number;
  loading: boolean;
  tableData: Array<AnyObject>;
}

const initialState: TableState = {
  pageSize: 10,
  currentPage: 1,
  total: 0,
  loading: false,
  tableData: [],
};

type TableAction =
  | { type: "INIT" }
  | { type: "SET_PAGE_SIZE"; currentPage?: number; pageSize?: number }
  | { type: "SET_TABLE_DATA"; tableData: Array<AnyObject>; total: number; currentPage?: number }
  | { type: "PATCH_ROW"; rowKey: string | number; rowKeyField: string; patch: AnyObject }
  | { type: "SET_LOADING" }
  | { type: "SET_TABLE_RECORDS"; tableData: Array<AnyObject> };

function reducer(state: TableState, action: TableAction): TableState {
  switch (action.type) {
    case "INIT":
      /** 仅进入 loading，保留上次数据，避免查询瞬间空态触发表体布局抖动（横向滚动条闪现） */
      return { ...state, loading: true, tableData: [] };
    case "SET_PAGE_SIZE":
      return {
        ...state,
        pageSize: action.pageSize ?? state.pageSize,
        currentPage: action.currentPage ?? state.currentPage,
      };
    case "SET_TABLE_DATA":
      return {
        ...state,
        tableData: action.tableData,
        total: action.total,
        ...(action.currentPage !== undefined ? { currentPage: action.currentPage } : {}),
      };
    case "PATCH_ROW": {
      const { rowKey, rowKeyField, patch } = action;
      const key = rowKey ?? "";
      let changed = false;
      const tableData = state.tableData.map((row) => {
        if (row?.[rowKeyField] !== key) return row;
        changed = true;
        return { ...row, ...patch };
      });
      return changed ? { ...state, tableData } : state;
    }
    case "SET_LOADING":
      return { ...state, loading: false };
    case "SET_TABLE_RECORDS":
      return { ...state, tableData: action.tableData };
    default:
      return state;
  }
}

export function useTableReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return { state, dispatch };
}
