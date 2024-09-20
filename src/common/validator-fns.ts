import Errors from './Errors';
import { ITimeCloneFns, TBasicTypes,TVldrFn } from './types';


interface ISharedProp<T> {
  prop: keyof T,
  type: TBasicTypes | 'object' | 'object[]' | 'pk' | 'fk';
  optional?: boolean;
  nullable?: boolean;
  vldrFn?: TVldrFn<T, keyof T>;
}

/**
 * Setup the validator function
 */
export function validateObj<T>(
  props: ISharedProp<T>[],
  timeCloneFns: ITimeCloneFns,
)  {
  return (arg: unknown) => {
    if (!arg || typeof arg !== 'object') {
      throw new Error(Errors.modelInvalid());
    }
    for (const prop of props) {
      const val = arg[prop.prop as keyof typeof arg];
      validateProp(prop, val, timeCloneFns)
    }
    return true;
  };
}

/**
 * Validate a value using a prop. NOTE, this doesn't check for missing,
 * cause we don't need to check for that in "getNew"
 */
export function validateProp<T>(
  prop: ISharedProp<T>,
  val: unknown,
  timeCloneFns: ITimeCloneFns,
): boolean {
  const propName = String(prop.prop);
  // Check db keys
  if (prop.type === 'fk' || prop.type === 'pk') {
    if (
      typeof val === 'number' || 
      (val === null && prop.type === 'fk' && prop.nullable)) {
    } else {
      throw new Error(Errors.relationalKey(propName));
    }
    return true;
  // Check optional
  } else if (val === undefined) {
    if (!prop.optional) {
      throw new Error(Errors.propMissing(propName));
    } else {
      true;
    }
  // Check null
  } else if (val === null) {
    if (!prop.nullable) {
      throw new Error(Errors.notNullable(propName));
    } else {
      return true;
    }
  // Check date
  } else if (prop.type === 'date') {
    if (!timeCloneFns.validateTime(val)) {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check array
  } else if (prop.type.endsWith('[]')) {
    return _validateArr(prop, val);
  // Check remaining types
  } else if (typeof val !== prop.type) {
    throw new Error(Errors.default(propName));
  }
  // Must always check function if there (except if null or undefined)
  if (!!prop.vldrFn && !prop.vldrFn?.(val)) {
    throw new Error(Errors.vldrFnFailed(propName));
  }
  // Return true if no errors thrown
  return true;
}

/**
 * Check array.
 */
function _validateArr<T>(prop: ISharedProp<T>, val: unknown): boolean {
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
