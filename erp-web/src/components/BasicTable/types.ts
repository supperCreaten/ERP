import type { TableColumnsType, TableProps } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import type { GetRowKey } from "antd/es/table/interface";

/** ref / onTableReady 暴露的表格 API */
export type BasicTableHandle = {
  getTableData: () => Promise<void>;
  setTableData: (data: Array<Record<string, unknown>>) => void;
  addTableRow: (row: Record<string, unknown>) => void;
  getTableRecords: () => void;
  /** 查询时重置到第 1 页再请求 */
  searchRefresh?: () => Promise<void>;
  /** 按 rowKey 合并更新当前页某一行（如缓存解密明文） */
  patchRow?: (rowKey: string | number, patch: AnyObject) => void;
};

/** 列表接口经 request 拦截器解包后的 data：分页对象或直接数组 */
export type BasicTableResponseData =
  | AnyObject[]
  | {
      rows?: AnyObject[];
      total?: number | string;
      pageNum?: number;
      pageSize?: number;
      startRow?: number;
      endRow?: number;
      sumColumn?: Record<string, unknown>;
      [key: string]: unknown;
    };

/** callback 直接拿到解包后的业务 data（不是 AxiosResponse） */
export type BasicTableCallback = (params: Record<string, unknown>) => Promise<BasicTableResponseData | null | undefined>;

export type BasicTableProps<T extends AnyObject = AnyObject> = {
  /** 默认 fixed；开启 scroll.y 时建议保持 fixed 以保证表头对齐 */
  tableLayout?: "auto" | "fixed";
  columns: TableColumnsType<T>;
  callback?: BasicTableCallback;
  onGetParams?: () => Record<string, unknown>;
  isShowPage?: boolean;
  /** 为 false 时不自动监听容器尺寸，需手动 recalculate（默认 true） */
  isAutoResize?: boolean;
  otherTableProps?: TableProps<T>;
  children?: React.ReactNode;
  /** 变化时重新请求（推荐，无需 ref） */
  reloadKey?: number | string;
  rowKey?: string | keyof T | GetRowKey<T>;
  isRequest?: boolean;
  /** 挂载后注册刷新方法（无需 ref / useImperativeHandle） */
  onTableReady?: (api: BasicTableHandle) => void;
  rowSelection?: TableProps<T>["rowSelection"];
};
