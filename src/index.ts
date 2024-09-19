import moment, { MomentInput } from 'moment';
import _ from 'lodash';

import setupGetNew from './setupGetNew';
import { ITimeCloneFns, TModelProp } from './common/types';
import checkObj, { TObjProp } from './checkObj';
import { validateObj, validateProp } from './common/validator-fns';
import Errors from './common/Errors';


// **** Types **** //

interface IModelInitializer {
  timeCloneFns: ITimeCloneFns;
  readonly init: <T>(props: TModelProp<T>[]) => IModelFns<T>;
  readonly checkObj: <T>(props: TObjProp<NonNullable<T>>[]) => (arg: unknown) => arg is NonNullable<T>;
}

interface IModelFns<T> {
  isValid: (arg: unknown) => arg is T;
  new: (arg?: Partial<T>) => T;
}


// **** Setup **** //

// Default Time/Deep-Clone functions
const DEFAULT_TIMECLONE_FNS: ITimeCloneFns = {
  cloneDeep: arg => _.cloneDeep(arg),
  validateTime: arg => moment(arg as MomentInput).isValid(),
  toDate: arg => moment(arg as MomentInput).toDate()
}

// Main
const ModelInitializer: IModelInitializer = {
  timeCloneFns: { ...DEFAULT_TIMECLONE_FNS },
  init<T>(props: TModelProp<T>[]) {
    _validateDefaults(props, this.timeCloneFns);
    const validate = validateObj<T>(props, this.timeCloneFns),
      getNew = setupGetNew<T>(props, this.timeCloneFns);
    return {
      isValid(arg: unknown): arg is T {
        return validate(arg);
      },
      new(arg?: Partial<T>): T {
        return getNew(arg);
      },
    };
  },
  checkObj<T>(props: TObjProp<T>[]) {
    return checkObj<T>(props, this.timeCloneFns);
  }
}


// **** Functions **** //

/**
 * Validate Defaults and make sure validator-fn is ther for objects
 */
function _validateDefaults<T>(
  props: TModelProp<T>[],
  timeCloneFns: ITimeCloneFns,
): boolean {
  for (const prop of props) {
    if (!('default' in prop)) {
      continue;
    }
    const propName = String(prop.prop);
    if ((prop.type === 'object') && !prop.vldrFn) {
      throw new Error(Errors.vldrFnMissing(String(prop.prop)));
    } else if (prop.type === 'object' && !prop.default && !prop.optional) {
      const msg = Errors.defaultNotFoundForObj(propName);
      throw new Error(msg);
    }
    validateProp(prop, prop.default, timeCloneFns)
  }
  return true;
}


// **** Export **** //

export { ITimeCloneFns } from './common/types';
export default ModelInitializer;
