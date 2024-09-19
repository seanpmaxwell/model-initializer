import moment from 'moment';
import lodash from 'lodash';

import Errors from './common/Errors';
import { TModelProp, TModelPropNotFks } from './common/types';
import { validateArr } from './common/validator-fns';


/**
 * Setup the "GetNew" function. Note that whether a property is optional or 
 * not, if you supply a default value, it will get initialized with that 
 * value.
 */
function setupGetNew<T>(props: TModelProp<T>[]) {
  return (arg: Partial<T> = {}): T => {
    // Loop array
    const retVal = {} as any;
    for (const prop of props) {
      const key = prop.prop,
        val = arg[key],
        propName = String(prop.prop),
        notThere = !(key in arg) || val === undefined;
      // Primary key
      if (prop.type === 'pk') {
        if (notThere) {
          retVal[key] = -1;
        } else if (typeof val === 'number') {
          retVal[key] = val;
        } else {
          throw new Error(Errors.relationalKey(propName));
        }
      // Foreign Key
      } else if (prop.type === 'fk') {
        if (notThere) {
          retVal[key] = (prop.default !== undefined ? prop.default : -1);
        } else if (typeof val === 'number' || (prop.nullable && val === null)) {
          retVal[key] = val;
        } else {
          throw new Error(Errors.relationalKey(propName));
        }
      // Check not there for non-keys
      } else if (notThere) {
        if (prop.optional && prop.default === undefined) {
          continue;
        } else {
          retVal[key] = _getDefault(prop);
        }
      // Check null
      } else if (val === null) {
        if (!prop.optional) {
          if (prop.nullable) {
            retVal[key] = null;
          // If value is null and not optional, use the default
          } else {
            retVal[key] = _getDefault(prop);
          }
        } else {
          continue;
        }
      // Set the value
      } else {
        retVal[key] = _copyAndValidate(prop, val);
      }
    }
    // Return
    return retVal as T;
  };
}

/**
 * Get the default value.
 */
function _getDefault<T>(prop: TModelPropNotFks<T>) {
  // Get default if it's there, but we still need to validate it.
  if (!!prop.default) {
    return _copyAndValidate(prop, prop.default);
  }
  // Get built-in defaults if default not specified.
  const propName = String(prop.prop);
  if (prop.type.endsWith('[]')) {
    return [];
  } else if (prop.type === 'string') {
    return '';
  } else if (prop.type === 'number') {
    return 0;
  } else if (prop.type === 'boolean') {
    return false;
  } else if (prop.type === 'date') {
    return moment().toDate();
  // Next two are failsafes (shouldn't get hit if typesafety works)
  } else if (prop.type === 'object') {
    const msg = Errors.defaultNotFoundForObj(propName);
    throw new Error(msg);
  } else {
    throw new Error(Errors.typeInvalid(propName));
  }
}

/**
 * Validate a value and copy it.
 */
function _copyAndValidate<T>(prop: TModelPropNotFks<T>, val: T[keyof T]) {
  const propName = String(prop.prop);
  // Date
  if (prop.type === 'date') {
    const temp = moment(val as moment.MomentInput);
    if (temp.isValid()) {
      return temp.toDate();
    } else {
      throw new Error(Errors.notValidDate(propName));
    }
  // Check/return array
  } else if (prop.type.endsWith('[]')) {
    if (!validateArr(prop, val)) {
      throw new Error(Errors.notValidArr(propName));
    } else {
      return lodash.cloneDeep(val);
    }
  // Check basic type
  } else if (prop.type !== typeof val) {
    throw new Error(Errors.default(propName));
  // Call validator function
  } else if (!!prop.vldrFn && !prop.vldrFn(val)) {
    throw new Error(Errors.vldrFnFailed(propName));
  // Check/return object
  } else if (typeof val === 'object') {
    if (!prop.vldrFn) {
      throw new Error(Errors.vldrFnMissing(propName));
    } else {
      return lodash.cloneDeep(val);
    }
  // Return basic type
  } else {
    return val;
  }
}


// **** Export default **** //

export default setupGetNew;
