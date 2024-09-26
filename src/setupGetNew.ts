import { ITimeCloneFns, TModelSchema } from './common/types';
import { validateProp } from './common/validator-fns';
import processType, { ITypeObj } from './common/processType';


/**
 * Setup the "GetNew" function. Note that whether a property is optional or 
 * not, if you supply a default value, it will get initialized with that 
 * value. Also, not being there doesn't cause errors, cause we just insert
 * the default.
 */
function setupGetNew<T>(schema: TModelSchema<T>, timeCloneFns: ITimeCloneFns) {
  return (arg: Partial<T> = {}): T => {
    // Loop array
    const retVal = {} as any;
    for (const key in schema) {
      const val = arg[key],
        schemaKey = schema[key],
        typeObj = processType(schemaKey);
      // If its not there
      if (!(key in arg) || val === undefined) {
        if (!typeObj.optional || typeObj.hasDefault) { // Skip
          retVal[key] = _getDefault(schemaKey, typeObj, timeCloneFns)
        }
        continue;
      // Check null, if value is null and not optional, use the default
      } else if (val === null) {
        if (!typeObj.optional) {
          if (typeObj.nullable) {
            retVal[key] = null;
          } else {
            retVal[key] = _getDefault(schemaKey, typeObj, timeCloneFns)
          }
        }
        continue;
      // Set the value if not null or undefined
      } else {
        validateProp(key, typeObj, val, timeCloneFns)
        if (typeof val === 'object') {
          retVal[key] = timeCloneFns.cloneDeep(val);
        } else {
          retVal[key] = val;
        }
      }
    }
    // Return
    return retVal;
  };
}

/**
 * Get the default value non including relational keys.
 */
function _getDefault<T>(
  schemaKey: TModelSchema<T>[keyof TModelSchema<T>],
  typeObj: ITypeObj,
  timeCloneFns: ITimeCloneFns,
) {
  if (typeof schemaKey === 'object' && schemaKey.hasOwnProperty('default')) {
    if (typeof schemaKey.default === 'object') {
      return timeCloneFns.cloneDeep(schemaKey.default);
    } else {
      return schemaKey.default;
    }
  } else if (typeObj.isArr) {
    return [];
  } else if (typeObj.type === 'string' || typeObj.type === 'email') {
    return '';
  } else if (typeObj.type === 'number') {
    return 0;
  } else if (typeObj.type === 'boolean') {
    return false;
  } else if (typeObj.type === 'date') {
    return new Date();
  } else if (typeObj.type === 'pk' || typeObj.type === 'fk') {
    return -1;
  }
}


// **** Export default **** //

export default setupGetNew;
