import processType from './processType';
import setupGetNew from './setupGetNew';
import { ITestObj, TModelSchema, TTestObjFnSchema, TAllTypeOptions } from './types';
import { validateDefaults, validateObj, validateProp } from './validator-fns';


interface IModelFns<T> {
  isValid: (arg: unknown) => arg is T;
  new: (arg?: Partial<T>) => T;
}


// **** ModelInitializer Class **** //

export class ModelInitializer {

  // Constructor
  constructor(cloneFn?: <T>(arg: T) => T) {
    if (!!cloneFn) {
      this.cloneFn = cloneFn;
    }
  }

  // Initialize a schema function
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

  // cloneFn
  private cloneFn = <T>(arg: T, isDate: boolean): T => {
    if (isDate) {
      return new Date(arg as any) as T;
    } else if (!!arg && typeof arg === 'object') {
      return structuredClone(arg);
    } else {
      return arg;
    }
  };

  // Static Test Object
  public static readonly Test: ITestObj = {
    obj<T>(schema: TTestObjFnSchema<T>) {
      const validate = validateObj<T>(schema);
      return (arg: unknown): arg is NonNullable<T> => validate(arg);
    },
    objarr<T>(schema: TTestObjFnSchema<T>) {
      const validate = validateObj<T>(schema);
      return (arg: unknown): arg is NonNullable<T>[] => {
        if (!Array.isArray(arg)) {
          return false;
        }
        for (const item of arg) {
          if (!(validate(item))) {
            return false;
          }
        }
        return true;
      };
    },
    val<T>(typeProp: TAllTypeOptions<T>) {
      const typeObj = processType('the value from val()', typeProp);
      return (arg: unknown) => {
        if (arg !== undefined && !!typeObj.transform) {
          arg = typeObj.transform(arg);
        }
        if (validateProp(typeObj, arg)) {
          return arg as T;
        } else {
          const propName = JSON.stringify(arg)
          throw new Error(propName + ' validate failed');
        }
      }

    }
  }

  // Dynamic test object
  public readonly test: ITestObj = { ...ModelInitializer.Test };
}


// **** Export **** //

export type TObjSchema<T> = TTestObjFnSchema<T>;
export default new ModelInitializer();
