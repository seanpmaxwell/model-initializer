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
  typeMap: Record<any, any>,
  cloneFn: <T>(arg: T, isDate: boolean) => T,
) {
  return (arg: Partial<T> = {}): T => {
    // Loop array
    const retVal = {} as any;
    for (const key in schema) {
      const typeObj: ITypeObj = typeMap[key],
        val = arg[key];
      // If the value is null and the property is optional, skip adding it
      if (val === null && typeObj.optional) {
        continue;
      }
      // If its not there
      if (!(key in arg) || val === undefined) {
        if (!typeObj.optional) {
          retVal[key] = cloneFn(typeObj.default, typeObj.isDate);
        }
        continue;
      }
      // Apply the transform function
      const argg: any = arg;
      if (!!typeObj.transform) {
        argg[key] = typeObj.transform(val);
      }
      // Validate and add
      if (validateProp(typeObj, argg[key])) {
        retVal[key] = cloneFn(argg[key], typeObj.isDate);
      }
    }
    // Return
    return retVal;
  };
}


// **** Export default **** //

export default setupGetNew;
