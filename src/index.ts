import setupGetNew from './setupGetNew';
import { ITimeCloneFns, TModelSchema, TTestObjFnSchema } from './common/types';
import { COLOR_RGX, EMAIL_RGX, validateDefaults, validateObj } from './common/validator-fns';


// **** Types **** //

interface IModelInitializer {
  readonly timeCloneFns: ITimeCloneFns;
  readonly init: <T>(props: TModelSchema<T>) => IModelFns<T>;
  readonly test: {
    validateTime: ITimeCloneFns['validateTime'];
    email: (val: unknown) => boolean;
    color: (val: unknown) => boolean;
    obj: <T>(props: TTestObjFnSchema<NonNullable<T>>) => (arg: unknown) => arg is NonNullable<T>;
  };
  readonly setTimeCloneFns: (param: ITimeCloneFns) => void;
}

interface IModelFns<T> {
  isValid: (arg: unknown) => arg is T;
  new: (arg?: Partial<T>) => T;
}


// **** Setup **** //

// Default Time/Deep-Clone functions
const DEFAULT_TIMECLONE_FNS: ITimeCloneFns = {
  cloneDeep(arg) {
    if (typeof arg === 'object') {
      return structuredClone(arg);
    } else {
      return arg;
    }
  },
  validateTime: arg => !isNaN(new Date(arg as any).getTime()),
  toDate: arg => new Date(arg as any),
}

// Main
const ModelInitializer: IModelInitializer = {
  timeCloneFns: { ...DEFAULT_TIMECLONE_FNS },
  init<T>(props: TModelSchema<T>) {
    const { validateTime } = this.timeCloneFns;
    validateDefaults(props, validateTime);
    const validate = validateObj<T>(props, validateTime),
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
  test: {
    validateTime: DEFAULT_TIMECLONE_FNS.validateTime,
    email: (val: unknown) => typeof val === 'string' && EMAIL_RGX.test(val),
    color: (val: unknown) => typeof val === 'string' && COLOR_RGX.test(val),
    obj<T>(schema: TTestObjFnSchema<T>) {
      const validate = validateObj<T>(schema, this.validateTime);
      return (arg: unknown): arg is NonNullable<T> => validate(arg);
    },
  },
  setTimeCloneFns(param: ITimeCloneFns) {
    (this as any).timeCloneFns = { ...param };
    this.test.validateTime = param.validateTime;
  }
}


// **** Export **** //

export { ITimeCloneFns } from './common/types';
export default ModelInitializer;
