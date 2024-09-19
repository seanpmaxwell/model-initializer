import moment from 'moment';

import Errors from './common/Errors';
import { TModelProp } from './common/types';
import { validateArr } from './common/validator-fns';


// **** Types **** //

/**
 * Setup the validator function
 */
function setupValidator<T>(props: TModelProp<T>[])  {
  return (arg: unknown) => {
    // Check record
    if (!arg || typeof arg !== 'object') {
      throw new Error(Errors.modelInvalid());
    }
    // Loop array
    for (const prop of props) {
      const val = arg[prop.prop as keyof typeof arg],
        propName = String(prop.prop);
      // Check db keys
      if (prop.type === 'fk' || prop.type === 'pk') {
        if (
          typeof val === 'number' || 
          (val === null && prop.type === 'fk' && prop.nullable)) {
          continue;
        } else {
          throw new Error(Errors.relationalKey(propName));
        }
      // Check present
      } else if (!(prop.prop in arg) || val === undefined) {
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

export default setupValidator;
