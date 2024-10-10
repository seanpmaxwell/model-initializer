import setupGetNew from './setupGetNew';
import { TModelSchema, TTestObjFnSchema } from './types';
import { validateDefaults, validateObj, vldtColor, vldtDate, vldtEmail } from './validator-fns';


// **** ModelInitializer Class **** //

interface IModelFns<T> {
  isValid: (arg: unknown) => arg is T;
  new: (arg?: Partial<T>) => T;
}

export class ModelInitializer {

  private cloneFn = <T>(arg: T, isDate: boolean): T => {
    if (isDate) {
      return new Date(arg as any) as T;
    } else if (!!arg && typeof arg === 'object') {
      return structuredClone(arg);
    } else {
      return arg;
    }
  };

  constructor(cloneFn?: <T>(arg: T) => T) {
    if (!!cloneFn) {
      this.cloneFn = cloneFn;
    }
  }

  public init<T>(props: TModelSchema<T>): IModelFns<T> {
    validateDefaults(props);
    const validate = validateObj<T>(props),
      getNew = setupGetNew<T>(props, this.cloneFn);
    return {
      isValid(arg: unknown): arg is T {
        return validate(arg);
      },
      new(arg?: Partial<T>): T {
        return getNew(arg);
      },
    };
  }
}


// **** Validator Object **** //

export const Vldt = {
  time: vldtDate,
  email: vldtEmail,
  color: vldtColor,
  obj<T>(schema: TTestObjFnSchema<T>) {
    const validate = validateObj<T>(schema);
    return (arg: unknown): arg is NonNullable<T> => validate(arg);
  },
}


// **** Export **** //

export { TTestObjFnSchema } from './types';
export default new ModelInitializer();
