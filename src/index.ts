import setupGetNew from './setupGetNew';
import { ITimeCloneFns, TModelSchema } from './common/types';
import checkObj, { TObjSchema } from './checkObj';
import { validateObj, validateProp } from './common/validator-fns';
import Errors from './common/Errors';
import processType from './common/processType';



// **** Types **** //

interface IModelInitializer {
  timeCloneFns: ITimeCloneFns;
  readonly init: <T>(props: TModelSchema<T>) => IModelFns<T>;
  readonly checkObj: <T>(props: TObjSchema<NonNullable<T>>) => (arg: unknown) => arg is NonNullable<T>;
}

interface IModelFns<T> {
  isValid: (arg: unknown) => arg is T;
  new: (arg?: Partial<T>) => T;
}


// **** Setup **** //

// Default Time/Deep-Clone functions
const DEFAULT_TIMECLONE_FNS: ITimeCloneFns = {
  cloneDeep: arg => structuredClone(arg),
  validateTime: arg => !isNaN(new Date(arg as any).getTime()),
  toDate: arg => new Date(arg as any),
}

// Main
const ModelInitializer: IModelInitializer = {
  timeCloneFns: { ...DEFAULT_TIMECLONE_FNS },
  init<T>(props: TModelSchema<T>) {
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
  checkObj<T>(props: TObjSchema<T>) {
    return checkObj<T>(props, this.timeCloneFns);
  }
}


// **** Functions **** //

/**
 * Validate Defaults and make sure validator-fn is ther for objects
 */
function _validateDefaults<T>(
  schema: TModelSchema<T>,
  timeCloneFns: ITimeCloneFns,
): boolean {
  for (const key in schema) {
    const schemaKey = schema[key];
    if (typeof schemaKey !== 'object' || !('default' in schemaKey)) {
      continue;
    }
    const propName = key,
      type = schemaKey.type;
    if (type.includes('object') && !('vldrFn' in schemaKey)) {
      throw new Error(Errors.vldrFnMissing(key));
    } else if (type === 'object' && !schemaKey.default) {
      const msg = Errors.defaultNotFoundForObj(propName);
      throw new Error(msg);
    }
    const typeObj = processType(schemaKey);
    validateProp(key, typeObj, schemaKey.default, timeCloneFns)
  }
  return true;
}


// **** Export **** //

export { ITimeCloneFns } from './common/types';
export default ModelInitializer;
