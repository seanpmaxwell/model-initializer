import Errors from './Errors';
import { TModelSchema, ITimeCloneFns, TTestObjFnSchema } from './types';
import processType, { ITypeObj } from './processType';


// Regexes
export const EMAIL_RGX = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
export const COLOR_RGX = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)


/**
 * Validate Defaults and make sure refine is there for objects
 */
export function validateDefaults<T>(
  schema: TModelSchema<T>,
  validateTime: ITimeCloneFns['validateTime'],
): boolean {
  for (const key in schema) {
    const schemaKey = schema[key];
    if (typeof schemaKey !== 'object' || !('default' in schemaKey)) {
      continue;
    }
    const propName = key,
      type = schemaKey.type;
    if (type.includes('object') && !('refine' in schemaKey)) {
      throw new Error(Errors.refineMissing(key));
    } else if (type === 'object' && !schemaKey.nullable && !schemaKey.default) {
      const msg = Errors.defaultNotFoundForObj(propName);
      throw new Error(msg);
    }
    const typeObj = processType(schemaKey);
    validateProp(key, typeObj, schemaKey.default, validateTime)
  }
  return true;
}

/**
 * Setup the validator function
 */
export function validateObj<T>(
  schema: TModelSchema<T> | TTestObjFnSchema<T>,
  validateTime: ITimeCloneFns['validateTime'],
)  {
  return (arg: unknown) => {
    if (!arg || typeof arg !== 'object') {
      throw new Error(Errors.modelInvalid());
    }
    for (const key in schema) {
      const val = (arg as Record<string, unknown>)[key],
        typeObj = processType(schema[key]);
      validateProp(key, typeObj, val, validateTime)
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
  validateTime: ITimeCloneFns['validateTime'],
): boolean {
  // Check optional
  if (val === undefined) {
    if (!typeObj.optional) {
      throw new Error(Errors.propMissing(propName));
    } else {
      return true;
    }
  // Check null
  } else if (typeObj.isArr) {
    if (!Array.isArray(val)) {
      throw new Error(Errors.notValidArr(propName));
    } else {
      val.forEach(val => _validateCore(propName, typeObj, val, validateTime));
    }
  // Check rest
  } else {
    _validateCore(propName, typeObj, val, validateTime)
  }
  // Return true if no errors thrown
  return true;
}

/**
 * Core validation
 */
export function _validateCore<T>(
  propName: string,
  typeObj: ITypeObj,
  val: unknown,
  validateTime: ITimeCloneFns['validateTime'],
): boolean {
  // Check null 
  if (val === null) {
    if (!typeObj.nullable) {
      throw new Error(Errors.notNullable(propName));
    }
    return true;
  // Check Date
  } else if (typeObj.isDate) {
    if (!validateTime(val)) {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check email
  } else if (typeObj.isEmail) {
    if ((typeof val !== 'string') || (!!val && !EMAIL_RGX.test(val))) {
      throw new Error(Errors.email(propName));
    }
   // Check relational key (null should be checked for at this point)
  } else if (typeObj.isRelationalKey) {
    if (typeof val !== 'number') {
      throw new Error(Errors.relationalKey(propName));
    }
  // Check color
  } else if (typeObj.isColor) {
    if ((typeof val !== 'string') || !COLOR_RGX.test(val)) {
      throw new Error(Errors.email(propName));
    }
  // Check base type
  } else if (typeof val !== typeObj.type) {
    throw new Error(Errors.default(propName));
  }
  // Must always check function if there (except if null or undefined)
  if (!!typeObj.refine && !typeObj.refine?.(val)) {
    throw new Error(Errors.refineFailed(propName));
  }
  // Return
  return true;
}
