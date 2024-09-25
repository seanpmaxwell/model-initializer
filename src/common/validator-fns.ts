import Errors from './Errors';
import { processType } from './misc';
import { ITimeCloneFns, TAllTypes, TVldrFn } from './types';


interface ISharedProp<T> {
  prop: keyof T,
  type: TAllTypes;
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
  const propName = String(prop.prop),
    { isArr, type, isOptional } = processType(prop.type);
  // Check db keys
  if (type === 'fk' || type === 'pk') {
    if (
      typeof val === 'number' || 
      (val === null && type === 'fk' && prop.nullable)) {
    } else {
      throw new Error(Errors.relationalKey(propName));
    }
    return true;
  // Check optional
  } else if (val === undefined) {
    if (!isOptional) {
      throw new Error(Errors.propMissing(propName));
    } else {
      return true;
    }
  // Check null
  } else if (val === null) {
    if (!prop.nullable) {
      throw new Error(Errors.notNullable(propName));
    } else {
      return true;
    }
  // Check date
  } else if (type === 'date') {
    if (!timeCloneFns.validateTime(val)) {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check array
  } else if (isArr) {
    return _validateArr(propName, type, val, prop.vldrFn);
  // Check remaining types
  } else if (typeof val !== type) {
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
function _validateArr<T>(
  propName: string,
  type: string,
  val: unknown,
  vldrFn: ISharedProp<T>['vldrFn'],
): boolean {
  // Check is array
  if (!Array.isArray(val)) {
    throw new Error(Errors.notValidArr(propName));
  }
  // Interfate
  for (const itemVal of val) {
    if (typeof itemVal !== type) {
      throw new Error(Errors.typeInvalid(propName));
    }
    if (type === 'object') {
      if (!vldrFn) {
        throw new Error(Errors.vldrFnMissing(propName));
      } else if (!vldrFn(itemVal)) {
        throw new Error(Errors.vldrFnFailed(propName));
      }
    }
  }
  return true;
}
