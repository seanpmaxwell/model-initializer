import Errors from './Errors';


interface IArrProp {
  prop: string | number | symbol;
  type: string;
  vldrFn?: (arg: unknown) => boolean;
}

/**
 * Check array.
 */
export function validateArr(prop: IArrProp, val: unknown): boolean {
  const propName = String(prop.prop);
  // Check is array
  if (!Array.isArray(val)) {
    throw new Error(Errors.notValidArr(propName));
  }
  const baseType = prop.type.slice(0, prop.type.length - 2);
  // Interfate
  for (const itemVal of val) {
    if (typeof itemVal !== baseType) {
      throw new Error(Errors.typeInvalid(propName));
    }
    if (baseType === 'object') {
      if (!prop.vldrFn) {
        throw new Error(Errors.vldrFnMissing(propName));
      } else if (!prop.vldrFn(itemVal)) {
        throw new Error(Errors.vldrFnFailed(propName));
      }
    }
  }
  return true;
}
