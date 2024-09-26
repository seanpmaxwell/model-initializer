import Errors from './Errors';
import { TModelSchema, ITimeCloneFns } from './types';
import { TObjSchema } from '../checkObj';
import processType, { ITypeObj } from './processType';


const EMAIL_RGX = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;

/**
 * Setup the validator function
 */
export function validateObj<T>(
  schema: TObjSchema<T> | TModelSchema<T>,
  timeCloneFns: ITimeCloneFns,
)  {
  return (arg: unknown) => {
    if (!arg || typeof arg !== 'object') {
      throw new Error(Errors.modelInvalid());
    }
    for (const key in schema) {
      const val = (arg as Record<string, unknown>)[key],
        typeObj = processType(schema[key]);
      validateProp(key, typeObj, val, timeCloneFns)
    }
    return true;
  };
}

/**
 * Validate a value using a prop. NOTE, this doesn't check for missing,
 * cause we don't need to check for that in "getNew"
 */
export function validateProp<T>(
  propName: string,
  typeObj: ITypeObj,
  val: unknown,
  timeCloneFns: ITimeCloneFns,
): boolean {
  // Check optional
 if (val === undefined) {
    if (!typeObj.optional) {
      throw new Error(Errors.propMissing(propName));
    } else {
      return true;
    }
  // Check null
  } else if (val === null) {
    if (!typeObj.nullable) {
      throw new Error(Errors.notNullable(propName));
    } else {
      return true;
    }
  // Check array
  } else if (typeObj.isArr) {
    if (!Array.isArray(val)) {
      throw new Error(Errors.notValidArr(propName));
    } else {
      val.forEach(val => _validate(propName, typeObj, val, timeCloneFns));
    }
  // Check rest
  } else {
    _validate(propName, typeObj, val, timeCloneFns)
  }
  // Return true if no errors thrown
  return true;
}

export function _validate<T>(
  propName: string,
  typeObj: ITypeObj,
  val: unknown,
  timeCloneFns: ITimeCloneFns,
): boolean {
  // Check date
  if (typeObj.isDate) {
    if (!timeCloneFns.validateTime(val)) {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check email
  } else if (typeObj.isEmail) {
    if ((typeof val !== 'string') || (!!val && !EMAIL_RGX.test(val))) {
      throw new Error(Errors.email(propName));
    }
  // Check base type
  } else if (typeof val !== typeObj.type) {
    throw new Error(Errors.default(propName));
  }
  // Must always check function if there (except if null or undefined)
  if (!!typeObj.vldrFn && !typeObj.vldrFn?.(val)) {
    throw new Error(Errors.vldrFnFailed(propName));
  }
  return true;
}
