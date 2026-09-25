import { TabsProps } from "antd"

/** 客户相关字典编码，与 sys_dict.dict_code 一致 */
export const CUSTOMER_DICT_CODE = {
  CREDIT_LEVEL: "customer_credit_level",
  CATEGORY: "customer_category",
} as const

export const tabs: TabsProps["items"] = [
  {
    label: "开票信息",
    key: "billingInfo",
  },
  {
    label: "业务联系人",
    key: "businessContact",
  },
]
