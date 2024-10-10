import { TModelSchema } from './types';
import { validateProp } from './validator-fns';
import processType, { ITypeObj } from './processType';


/**
 * Setup the "GetNew" function. Note that whether a property is optional or 
 * not, if you supply a default value, it will get initialized with that 
 * value. Also, not being there doesn't cause errors, cause we just insert
 * the default.
 */
function setupGetNew<T>(
  schema: TModelSchema<T>,
  cloneFn: <T>(arg: T, isDate: boolean) => T,
) {
  // Process types
  const typeMap = {} as any;
  for (const key in schema) {
    const schemaKey = schema[key];
    typeMap[key] = processType(key, schemaKey);
  }
  // Run getNew
  return (arg: Partial<T> = {}): T => {
    // Loop array
    const retVal = {} as any;
    for (const key in schema) {
      const val = arg[key],
        typeObj = typeMap[key];
      // If the value is null and the property is optional, skip adding it
      if (val === null && typeObj.optional) {
        continue;
      }
      // If its not there
      if (!(key in arg) || val === undefined) {
        if (!typeObj.optional) {
          if (typeObj.hasDefault) {
            retVal[key] = cloneFn(typeObj.default, typeObj.isDate);
          } else {
            retVal[key] = _getDefault(typeObj);
          }
        }
      // Validate and copy the value if its there
      } else {
        validateProp(typeObj, val)
        retVal[key] = cloneFn(val, typeObj.isDate);
      }
    }
    // Return
    return retVal;
  };
}

/**
 * Get the default value non including relational keys.
 */
function _getDefault<T>(typeObj: ITypeObj) {
  if (typeObj.isArr) {
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
  } else if (typeObj.type === 'color') {
    return '#FFFFFF';
  }
}


// **** Export default **** //

export default setupGetNew;
