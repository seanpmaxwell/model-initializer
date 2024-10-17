
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

/**
 * Check if non object array.
 */
export function nonArrObj(arg: unknown): arg is Record<string, unknown> {
  return typeof arg === 'object' && !Array.isArray(arg);
}

/**
 * Get the keys of an enum object.
 */
export function getEnumKeys(arg: unknown): string[] {
  if (nonArrObj(arg)) {
    return Object.keys(arg).reduce((arr: any[], key) => {
      if (!arr.includes(key)) {
        arr.push(arg[key]);
      }
      return arr;
    }, []);
  }
  throw Error('"getEnumKeys" be an non-array object');
}

/**
 * Get the values of an enum object.
 */
export function getEnumVals(arg: unknown) {
  if (nonArrObj(arg)) {
    const keys = getEnumKeys(arg);
    return keys.map(key => arg[key])
  }
  throw Error('"getEnumVals" be an non-array object');
}
