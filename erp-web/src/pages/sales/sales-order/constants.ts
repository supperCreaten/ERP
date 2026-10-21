/**
 * 销售订单相关字典编码，与 sys_dict.dict_code 一致。
 * 业务可配置枚举走字段管理；系统固定/行业标准枚举见下方本地 OPTIONS。
 */
export const SALES_ORDER_DICT_CODE = {
  /** 销售类型 */
  SALES_TYPE: "sales_type",
} as const

/** @deprecated 请使用 SALES_ORDER_DICT_CODE.SALES_TYPE */
export const SALES_TYPE_CODE = SALES_ORDER_DICT_CODE.SALES_TYPE

/** 单据状态：与 biz_sales_order.bill_status 注释一致，流程状态由系统维护，前端本地写死 */
export const BILL_STATUS = {
  DRAFT: "draft",
  AUDITED: "audited",
  CLOSED: "closed",
  CANCELLED: "cancelled",
} as const

export const BILL_STATUS_OPTIONS = [
  { label: "草稿", value: BILL_STATUS.DRAFT },
  { label: "已审核", value: BILL_STATUS.AUDITED },
  { label: "已关闭", value: BILL_STATUS.CLOSED },
  { label: "作废", value: BILL_STATUS.CANCELLED },
]

export const BILL_STATUS_LABEL: Record<string, string> = {
  [BILL_STATUS.DRAFT]: "草稿",
  [BILL_STATUS.AUDITED]: "已审核",
  [BILL_STATUS.CLOSED]: "已关闭",
  [BILL_STATUS.CANCELLED]: "作废",
}

/** 含税标志：与表字段注释一致（0未税 1含税），二值固定，前端本地写死 */
export const TAX_INCLUDED = {
  NO: "0",
  YES: "1",
} as const

export const TAX_INCLUDED_OPTIONS = [
  { label: "含税", value: TAX_INCLUDED.YES },
  { label: "未税", value: TAX_INCLUDED.NO },
]

/** 币种：行业常用币种，前端本地写死 */
export const CURRENCY = {
  CNY: "CNY",
  USD: "USD",
  EUR: "EUR",
  HKD: "HKD",
} as const

export const CURRENCY_OPTIONS = [
  { label: "人民币", value: CURRENCY.CNY },
  { label: "美元", value: CURRENCY.USD },
  { label: "欧元", value: CURRENCY.EUR },
  { label: "港币", value: CURRENCY.HKD },
]

/** 常用增值税税率(%)，前端本地写死 */
export const TAX_RATE_OPTIONS = [
  { label: "0%", value: "0" },
  { label: "1%", value: "1" },
  { label: "3%", value: "3" },
  { label: "6%", value: "6" },
  { label: "9%", value: "9" },
  { label: "13%", value: "13" },
]
