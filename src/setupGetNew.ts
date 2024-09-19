import { ITimeCloneFns, TModelProp, TModelPropNotFks } from './common/types';
import { validateProp } from './common/validator-fns';


/**
 * Setup the "GetNew" function. Note that whether a property is optional or 
 * not, if you supply a default value, it will get initialized with that 
 * value. Also, not being there doesn't cause errors, cause we just insert
 * the default.
 */
function setupGetNew<T>(props: TModelProp<T>[], timeCloneFns: ITimeCloneFns) {
  return (arg: Partial<T> = {}): T => {
    // Loop array
    const retVal = {} as any;
    for (const prop of props) {
      const key = prop.prop,
        val = arg[key],
        notThere = !(key in arg) || val === undefined;
      // If the user passed a value, need to check it
      if (!notThere) {
        validateProp(prop, val, timeCloneFns);
      }
      // Primary key
      if (prop.type === 'pk') {
        if (notThere) {
          retVal[key] = -1;
        } else {
          retVal[key] = val;
        }
      // Foreign Key
      } else if (prop.type === 'fk') {
        if (notThere) {
          retVal[key] = (prop.default !== undefined ? prop.default : -1);
        } else {
          retVal[key] = val;
        }
      // Check not there for non-keys
      } else if (notThere) {
        if (prop.optional && prop.default === undefined) { // Skip
          continue;
        } else {
          retVal[key] = _getDefault(prop, timeCloneFns);
        }
      // Check null, if value is null and not optional, use the default
      } else if (val === null) {
        if (!prop.optional) {
          if (prop.nullable) {
            retVal[key] = null;
          } else {
            retVal[key] = _getDefault(prop, timeCloneFns);
          }
        }
      // Set the value
      } else {
        retVal[key] = _clone<T>(val, timeCloneFns);
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
  prop: TModelPropNotFks<T>,
  timeCloneFns: ITimeCloneFns,
) {
  if (!!prop.default) {
    return _clone<T>(prop.default, timeCloneFns);
  } else if (prop.type.endsWith('[]')) {
    return [];
  } else if (prop.type === 'string') {
    return '';
  } else if (prop.type === 'number') {
    return 0;
  } else if (prop.type === 'boolean') {
    return false;
  } else if (prop.type === 'date') {
    return new Date();
  }
}

/**
 * Validate a value and copy it.
 */
function _clone<T>(
  val: T[keyof T] | -1,
  timeCloneFns: ITimeCloneFns,
): typeof val {
  if (typeof val === 'object') {
    return timeCloneFns.cloneDeep(val);
  } else {
    return val;
  }
}


// **** Export default **** //

export default setupGetNew;
