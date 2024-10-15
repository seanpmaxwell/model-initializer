import Errors from './Errors';
import processType, { ITypeObj } from './processType';
import Regexes from './Regexes';
import setupGetNew from './setupGetNew';
import { TModelSchema, TTestFnSchema } from './types';
import { validateDefaults, validateObj, validateProp } from './validator-fns';


// **** ModelInitializer Class **** //

export class ModelInitializer {

  // Readonly fields

  public readonly rgxs = { ...Regexes };

  /**
   * Constructor
   */
  constructor(cloneFn?: <T>(arg: T) => T) {
    if (!!cloneFn) {
      this.cloneFn = cloneFn;
    }
  }

  /**
   * Initialize a schema function
   */
  public init<T>(schema: TModelSchema<T>) {
    // Process types
    const typeMap = {} as Record<any, any>;
    for (const key in schema) {
      const schemaKey = schema[key];
      typeMap[key] = processType(key, schemaKey);
    }
    // Setup functions
    validateDefaults(schema, typeMap);
    const isValid = validateObj<T>(schema, typeMap),
      getNew = setupGetNew<T>(schema, typeMap, this.cloneFn);
    // Return
    return {
      isValid,
      new: (arg?: Partial<T>) => getNew(arg),
      pick<K extends keyof T>(prop: K) {
        const typeObj: ITypeObj = typeMap[prop];
        return {
          default: typeMap[prop].default as T[K],
          vldt: (arg: unknown): arg is NonNullable<T[K]> => {
            if (arg === undefined) {
              throw new Error(Errors.propMissing(String(prop)))
            }
            return validateProp(typeObj, arg);
          }
        };
      }
    };
  }

  /**
   * Test an object schema
   */
  public test<T>(schema: TTestFnSchema<T>) {
    const typeMap = {} as Record<any, any>;
    for (const key in schema) {
      const schemaKey = schema[key];
      typeMap[key] = processType(key, schemaKey);
    }
    const validate = validateObj<T>(schema, typeMap);
    return (arg: unknown): arg is NonNullable<T> => validate(arg);
  }

  /**
   * Test an object schema in an array of objects
   */
  public testArr<T>(schema: TTestFnSchema<T>) {
    const validate = this.test(schema);
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
  }

  /**
   * cloneFn
   */
  private cloneFn = <T>(arg: T, isDate: boolean): T => {
    if (isDate) {
      return new Date(arg as any) as T;
    } else if (!!arg && typeof arg === 'object') {
      return structuredClone(arg);
    } else {
      return arg;
    }
  };
}



// **** Export **** //

export type TObjSchema<T> = TTestFnSchema<T>;
export default new ModelInitializer();
