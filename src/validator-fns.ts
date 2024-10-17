import Errors from './Errors';
import { TModelSchema, TTestFnSchema } from './types';
import { IProcessedType } from './processType';
import { isObj, isStr } from './misc';


/**
 * Validate Defaults and make sure refine is there for objects
 */
export function validateDefaults<T>(
  schema: TModelSchema<T>,
  typeMap: Record<string, IProcessedType>,
): boolean {
  for (const schemaPropKey in schema) {
    // Init
    const schemaPropVal = schema[schemaPropKey];
    let hasRefine = false,
      default_,
      type = '';
    if (isObj(schemaPropVal) && ('default' in schemaPropVal)) {
      if ('default' in schemaPropVal) {
        default_ = schemaPropVal.default;
      }
      if ('type' in schemaPropVal && typeof schemaPropVal.type === 'string') {
        type = schemaPropVal.type;
      } else {
        throw new Error('Type should be a string on the object.');
      }
      hasRefine = schemaPropVal.hasOwnProperty('refine');
    } else if (isStr(schemaPropVal)) {
      type = schemaPropVal;
    }
    // Check requirements
    if (type.includes('any') && !hasRefine) {
      throw new Error(Errors.refineMissing(schemaPropKey));
    } else if (type.includes('any') && default_ === undefined) {
      throw new Error(Errors.defaultNotFoundForObj(schemaPropKey));
    }
    // Validate default if there
    if (default_ !== undefined) {
      _wrapErr(typeMap[schemaPropKey], default_);
    }
  }
  return true;
}

/**
 * Wrapper error object.
 */
function _wrapErr(pObj: IProcessedType, defaultVal: unknown): void {
  try {
    validateProp(pObj, defaultVal)
  } catch (err) {
    let errStr;
    if (err instanceof Error) {
      errStr = err.message;
    } else if (isStr(err)) {
      errStr = err;
    } else {
      errStr = String(err);
    }
    throw new Error('Error was thrown when checking defaults: ' + errStr);
  }
}

/**
 * Setup the validator function
 */
export function validateObj<T>(
  schema: TModelSchema<T> | TTestFnSchema<T>,
  typeMap: Record<string, IProcessedType>,
) {
  // Run validate
  return (paramArg: unknown): paramArg is T => {
    if (!isObj(paramArg)) {
      throw new Error(Errors.modelInvalid());
    }
    const arg = paramArg as Record<string, unknown>;
    for (const key in schema) {
      const pObj = typeMap[key];
      // Apply the transform function here so we can modify original object
      if (arg[key] !== undefined && !!pObj.transform) {
        arg[key] = pObj.transform(arg[key]);
      }
      // Run validation
      validateProp(pObj, arg[key])
    }
    return true;
  };
}

/**
 * Validate a value using a prop. NOTE, this doesn't check for missing,
 * cause we don't need to check for that in "getNew"
 */
export function validateProp(pObj: IProcessedType, val: unknown): boolean {
  const { propName } = pObj;
  // Check optional
  if (val === undefined) {
    if (!pObj.optional) {
      throw new Error(Errors.propMissing(propName));
    } else {
      return true;
    }
  // Check null
  } else if (pObj.isArr) {
    if (!Array.isArray(val)) {
      throw new Error(Errors.notValidArr(propName));
    } else {
      val.forEach(val => _validateCore(pObj, val));
    }
  // Check rest
  } else {
    _validateCore(pObj, val)
  }
  // Return true if no errors thrown
  return true;
}

/**
 * Core validation
 */
export function _validateCore(pObj: IProcessedType, val: unknown): boolean {
  const { propName } = pObj;
  // Check null 
  if (val === null) {
    if (!pObj.nullable) {
      throw new Error(Errors.notNullable(propName));
    }
    return true;
  // Check Date
  } else if (pObj.isDate) {
    if (isNaN(new Date(val as any).getTime())) {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check number type
  } else if (pObj.type === 'number') {
    if (typeof val !== 'number' || isNaN(val)) {
      throw new Error(Errors.default(propName));
    }
    if (!!pObj.range && !pObj.range(val)) {
      throw new Error(Errors.rangeValidationFailed(propName));
    }
  // Check "typeof" type
  } else if (pObj.type !== 'any' && typeof val !== pObj.type) {
    throw new Error(Errors.default(propName));
  }
  // Must always check "refine" functions if there
  if (
    (!!pObj.refine && !pObj.refine(val)) || 
    (!!pObj._refine && !pObj._refine(val))
  ) {
    throw new Error(Errors.default(propName));
  }
  // Return
  return true;
}
