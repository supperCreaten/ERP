/**
 * 判断给定的值是否为有限数字
 */
export function isNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * 判断一个值是否为字符串类型
 */
export function isString(value: unknown) {
  return typeof value === "string";
}
