import moment from 'moment';

import Errors from './common/Errors';
import { TBasicTypes, TVldrFn } from './common/types';
import { validateArr } from './common/validator-fns';


// **** Types **** //

type NotNoU<T> = Exclude<T, undefined | null> 

// Validator function is required for objects.
type TObjProp<T> = {
  [K in keyof T]: {
    prop: K,
    type: TBasicTypes;
    optional?: boolean;
    nullable?: boolean;
    vldrFn?: TVldrFn<T,K>;
  } | {
    prop: K,
    type: 'object' | 'object[]';
    optional?: boolean;
    nullable?: boolean;
    vldrFn: TVldrFn<T,K>;
  }
}[keyof T];


// **** Functions **** //

/**
 * Check object function
 */
function checkObject<T>(
  props: TObjProp<NotNoU<T>>[],
): (arg: unknown) => arg is T {
  const validate = setupObjValidator<T>(props);
  return (arg: unknown): arg is T => {
    return validate(arg);
  };
}

/**
 * Setup the validator function. Similar to the main "setupValidator" function
 * but there's not default prop and we don't worry about relational-keys.
 */
function setupObjValidator<T>(props: TObjProp<NotNoU<T>>[])  {
  return (arg: unknown) => {
    // Check record
    if (!arg || typeof arg !== 'object') {
      throw new Error(Errors.modelInvalid());
    }
    // Loop array
    for (const prop of props) {
      const val = arg[prop.prop as keyof typeof arg],
        propName = String(prop.prop);
      // Check optional
      if (!(prop.prop in arg) || val === undefined) {
        if (!prop.optional) {
          throw new Error(Errors.propMissing(propName));
        } else {
          continue;
        }
      // Check null
      } else if (val === null && prop.nullable) {
        continue;
      // Check date
      } else if (prop.type === 'date') {
        if (!moment(val).isValid()) {
          throw new Error(Errors.notValidDate(propName));
        }
      // Check array
      } else if (prop.type.endsWith('[]')) {
        return validateArr(prop, val);
      // Check other types
      } else if (typeof val !== prop.type) {
        throw new Error(Errors.default(propName));
      }
      // Objects must have validator functions
      if ((prop.type === 'object') && !prop.vldrFn) {
        throw new Error(Errors.vldrFnMissing(propName));
      }
      // Must always check function if truthy
      if (!!prop.vldrFn && !prop.vldrFn(val)) {
        throw new Error(Errors.vldrFnFailed(propName));
      }
    }
    // Return
    return true;
  };
}


// **** Export default **** //

export default checkObject;
