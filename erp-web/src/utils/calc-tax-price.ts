import NP from "number-precision"
import { trimTrailingZeros } from "@/utils/format"

/** 金额保留 4 位小数，末尾连续 0 简化 */
function formatAmount(value: number) {
  return trimTrailingZeros(NP.round(value, 4).toFixed(4))
}

/** 单价 / 数量保留 2 位小数，末尾连续 0 简化 */
function formatPrice(value: number) {
  return trimTrailingZeros(NP.round(value, 2).toFixed(2))
}

/**
 * 含税单价（保留 2 位，末尾连续 0 简化）
 * 入参不做类型判断。
 */
export function calcTaxInclusiveUnitPrice(taxInclusiveUnitPrice: any) {
  return formatPrice(taxInclusiveUnitPrice)
}

/**
 * 含税金额 = 含税单价 * 数量（保留 4 位）
 */
export function calcTaxInclusiveAmount(taxInclusiveUnitPrice: any, quantity: any) {
  return formatAmount(NP.times(taxInclusiveUnitPrice, quantity))
}

/**
 * 不含税金额 = 含税金额 / (1 + 税率)（保留 4 位）
 * @param taxRate 税率(%)，如 13 表示 13%
 */
export function calcUntaxedAmount(taxInclusiveAmount: any, taxRate: any) {
  const rate = NP.divide(taxRate, 100)
  return formatAmount(NP.divide(taxInclusiveAmount, NP.plus(1, rate)))
}

/**
 * 税额 = 含税金额 - 不含税金额（保留 4 位）
 */
export function calcTaxAmount(taxInclusiveAmount: any, untaxedAmount: any) {
  return formatAmount(NP.minus(taxInclusiveAmount, untaxedAmount))
}

export type TaxPriceCalcResult = {
  /** 含税单价（2 位） */
  taxInclusiveUnitPrice: string
  /** 数量（2 位） */
  quantity: string
  /** 含税金额（4 位） */
  taxInclusiveAmount: string
  /** 不含税金额（4 位） */
  amount: string
  /** 不含税单价（2 位） */
  unitPrice: string
  /** 税额（4 位） */
  taxAmount: string
  /** 税率(%) */
  taxRate: string
}

/**
 * 依次执行四个计价方法：
 * 1. calcTaxInclusiveUnitPrice → 含税单价
 * 2. calcTaxInclusiveAmount → 含税金额
 * 3. calcUntaxedAmount → 不含税金额
 * 4. calcTaxAmount → 税额
 *
 * 另据「不含税金额 / 数量」得到不含税单价；入参不做类型判断。
 */
export function calcTaxInclusivePriceFields(
  taxInclusiveUnitPrice: any,
  quantity: any,
  taxRate: any,
): TaxPriceCalcResult {
  const taxInclusiveUnitPriceFmt = calcTaxInclusiveUnitPrice(taxInclusiveUnitPrice)
  const quantityFmt = formatPrice(quantity)
  const taxInclusiveAmount = calcTaxInclusiveAmount(taxInclusiveUnitPriceFmt, quantityFmt)
  const amount = calcUntaxedAmount(taxInclusiveAmount, taxRate)
  const taxAmount = calcTaxAmount(taxInclusiveAmount, amount)
  const unitPrice = formatPrice(NP.divide(amount, quantityFmt))

  return {
    taxInclusiveUnitPrice: taxInclusiveUnitPriceFmt,
    quantity: quantityFmt,
    taxInclusiveAmount,
    amount,
    unitPrice,
    taxAmount,
    taxRate: trimTrailingZeros(String(taxRate)),
  }
}
