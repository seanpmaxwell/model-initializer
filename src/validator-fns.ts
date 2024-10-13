import Errors from './Errors';
import Regexes from './Regexes';
import { TModelSchema, TTestFnSchema } from './types';
import processType, { ITypeObj } from './processType';


/**
 * Validate Defaults and make sure refine is there for objects
 */
export function validateDefaults<T>(
  schema: TModelSchema<T>,
  typeMap: Record<any, any>,
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
    } else if (type === 'object' && !schemaKey.default) {
      const msg = Errors.defaultNotFoundForObj(propName);
      throw new Error(msg);
    }
    const typeObj = typeMap[key];
    validateProp(typeObj, schemaKey.default)
  }
  return true;
}

/**
 * Setup the validator function
 */
export function validateObj<T>(
  schema: TModelSchema<T> | TTestFnSchema<T>,
  typeMap: Record<any, any>,
) {
  // Run validate
  return (arg: unknown): arg is T => {
    if (!arg || typeof arg !== 'object') {
      throw new Error(Errors.modelInvalid());
    }
    for (const key in schema) {
      const typeObj = typeMap[key];
      // Apply the transform function here so we can modify original object
      const argg: any = arg;
      if (argg[key] !== undefined && !!typeObj.transform) {
        argg[key] = typeObj.transform(argg[key]);
      }
      const val = argg[key];
      // Run validation
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
    if (isNaN(new Date(val as any).getTime())) {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check email, empty string is allowd
  } else if (typeObj.isEmail) {
    if ((typeof val !== 'string') || (!!val && !Regexes.email(val))) {
      throw new Error(Errors.email(propName));
    }
   // Check relational key (null should be checked for at this point)
  } else if (typeObj.isRelationalKey) {
    if (typeof val !== 'number') {
      throw new Error(Errors.relationalKey(propName));
    }
  // Check color, empty string is not allowed
  } else if (typeObj.isColor) {
    if ((typeof val !== 'string') || !Regexes.color(val)) {
      throw new Error(Errors.color(propName));
    }
  // Check number type
  } else if (typeObj.type === 'number') {
    if (typeof val !== 'number' || isNaN(val)) {
      throw new Error(Errors.default(propName));
    }
  // Check rest
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
