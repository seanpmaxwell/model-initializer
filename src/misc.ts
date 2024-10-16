
/**
 * Check is number
 */
export function isNum(arg: unknown): arg is number {
  return typeof arg === 'number';
}

/**
 * Check is num
 */
export function isObj(arg: unknown): arg is NonNullable<object> {
  return !!arg && typeof arg === 'object';
}

/**
 * Check is string
 */
export function isStr(arg: unknown): arg is string {
  return typeof arg === 'string';
}
