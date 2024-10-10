import Errors from './Errors';
import { TModelSchema, TTestObjFnSchema } from './types';
import processType, { ITypeObj } from './processType';


// Regexes
const EMAIL_RGX = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
const COLOR_RGX = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)

// Simple Functions
export const vldtEmail = (val: unknown) => typeof val === 'string' && EMAIL_RGX.test(val);
export const vldtColor = (val: unknown) => typeof val === 'string' && COLOR_RGX.test(val);
export const vldtDate = (arg: unknown) => !isNaN(new Date(arg as any).getTime());


/**
 * Validate Defaults and make sure refine is there for objects
 */
export function validateDefaults<T>(schema: TModelSchema<T>): boolean {
  for (const key in schema) {
    const schemaKey = schema[key];
    if (typeof schemaKey !== 'object' || !('default' in schemaKey)) {
      continue;
    }
    const propName = key,
      type = schemaKey.type;
    if (type.includes('object') && !('refine' in schemaKey)) {
      throw new Error(Errors.refineMissing(key));
    } else if (type === 'object' && !schemaKey.default) {
      const msg = Errors.defaultNotFoundForObj(propName);
      throw new Error(msg);
    }
    const typeObj = processType(key, schemaKey);
    validateProp(typeObj, schemaKey.default)
  }
  return true;
}

/**
 * Setup the validator function
 */
export function validateObj<T>(schema: TModelSchema<T> | TTestObjFnSchema<T>) {
  // Process types
  const typeMap = {} as any;
  for (const key in schema) {
    const schemaKey = schema[key];
    typeMap[key] = processType(key, schemaKey);
  }
  // Run validate
  return (arg: unknown) => {
    if (!arg || typeof arg !== 'object') {
      throw new Error(Errors.modelInvalid());
    }
    for (const key in schema) {
      const val = (arg as Record<string, unknown>)[key],
        typeObj = typeMap[key];
      validateProp(typeObj, val)
    }
    return true;
  };
}

/**
 * Validate a value using a prop. NOTE, this doesn't check for missing,
 * cause we don't need to check for that in "getNew"
 */
export function validateProp(typeObj: ITypeObj, val: unknown): boolean {
  const { propName } = typeObj;
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
      val.forEach(val => _validateCore(typeObj, val));
    }
  // Check rest
  } else {
    _validateCore(typeObj, val)
  }
  // Return true if no errors thrown
  return true;
}

/**
 * Core validation
 */
export function _validateCore(typeObj: ITypeObj, val: unknown): boolean {
  const { propName } = typeObj;
  // Check null 
  if (val === null) {
    if (!typeObj.nullable) {
      throw new Error(Errors.notNullable(propName));
    }
    return true;
  // Check Date
  } else if (typeObj.isDate) {
    if (!vldtDate(val)) {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check email, empty string is allowd
  } else if (typeObj.isEmail) {
    if ((typeof val !== 'string') || (!!val && !EMAIL_RGX.test(val))) {
      throw new Error(Errors.email(propName));
    }
   // Check relational key (null should be checked for at this point)
  } else if (typeObj.isRelationalKey) {
    if (typeof val !== 'number') {
      throw new Error(Errors.relationalKey(propName));
    }
  // Check color, empty string is not allowed
  } else if (typeObj.isColor) {
    if ((typeof val !== 'string') || !COLOR_RGX.test(val)) {
      throw new Error(Errors.email(propName));
    }
  // Check base type
  } else if (typeof val !== typeObj.type) {
    throw new Error(Errors.default(propName));
  }
  // Must always check function if there
  if (!!typeObj.refine && !typeObj.refine?.(val)) {
    throw new Error(Errors.refineFailed(propName));
  }
  // Return
  return true;
}
