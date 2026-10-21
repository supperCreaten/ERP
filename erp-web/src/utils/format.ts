/** 不允许输入 0 的字段，可按业务在此追加 */
const DISALLOW_ZERO_FIELDS = new Set<string>([
  'transactionQty',
  'settleQty',
  'toleranceRateLower',
  'toleranceRateUpper',
  'balanceControl',
  'estimatedQty',
  'paymentAmount',
  'deductWeight',
]);

const disallowZeroValue = (value: string) => {
  if (!value) return value;
  // 输入过程中保留 "0."，便于输入 0.xx
  if (value.endsWith('.')) return value;
  const num = Number(value);
  if (!Number.isNaN(num) && num === 0) return '';
  return value;
};

/**
 * 去掉小数末尾连续的 0，以及多余的小数点。如 52.00 → 52，52.200 → 52.2，52. → 52
 * 建议在 onBlur 时调用，避免输入过程中无法输入 52.01 这类值
 */
export const trimTrailingZeros = (value: string) => {
  if (!value || !value.includes('.')) return value;
  return value.replace(/0+$/, '').replace(/\.$/, '');
};

/**
 * 格式化小数位数（输入过程中使用，不去除末尾 0）
 * @param value 需要格式化的值
 * @param place 允许输入几位小数
 * @param field  格式化的字段
 * @returns 格式化后的值
 */
export const formartDecimalPlaces = (value: string, place: number = 4, field?: string) => {
  const reg = new RegExp(`^(\\d+)\\.(\\d{${place}}).*$`);
  let result = value
    .replace(/[^0-9.]/g, '')
    .replace(/^0(\d)/, '0$1')
    .replace(/^\./, '0.')
    .replace(/\.{2,}/g, '.')
    .replace('.', '$#$')
    .replace(/\./g, '')
    .replace('$#$', '.')
    .replace(reg, '$1.$2')
    .replace(/^0+(\d)/, '$1');

  if (field && DISALLOW_ZERO_FIELDS.has(field)) {
    result = disallowZeroValue(result);
  }

  return result;
};

/** 限制输入为正整数或 0（不允许小数）；带小数时取整数部分，如 52.00 → 52 */
export const formartInteger = (value: string) => {
  const intPart = value.replace(/[^\d.]/g, '').split('.')[0] ?? '';
  return intPart.replace(/^0+(\d)/, '$1');
};
