import Errors from './Errors';
import { isObj } from './util';
import processType, { IProcessedType } from './processType';
import StringFormats from './StringFormats';
import { TModelSchema, TPickRet, TTestFnSchema } from './types';
import { validateDefaults, validateObj, validateProp } from './validator-fns';


// **** ModelInitializer Class **** //

export class ModelInitializer {

  public static readonly STRING_FORMATS = { ...StringFormats };
  public readonly StringFormats = { ...StringFormats };

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
  public init<T = void, U extends TModelSchema<T> = TModelSchema<T>>(schema: U) {
    // Process types
    const typeMap: Record<any, IProcessedType> = {};
    for (const key in schema) {
      const schemaKey = schema[key];
      typeMap[key] = processType(key, schemaKey, this.cloneFn);
    }
    // Validate the defaults
    validateDefaults(schema, typeMap);
    // Return
    return {
      isValid: validateObj<T>(schema, typeMap),
      new: this.setupGetNew<T>(schema, typeMap),
      pick: <K extends keyof T>(prop: K) => (({
        default(): Exclude<T[K], undefined> {
          return typeMap[prop].getDefault() as Exclude<T[K], undefined>;
        },
        vldt(arg: unknown): arg is Exclude<T[K], undefined> {
          if (arg === undefined) {
            throw new Error(Errors.propMissing(String(prop)))
          }
          return validateProp(typeMap[prop], arg);
        },
        ...(!!typeMap[prop].pick ? {
          pick: typeMap[prop].pick,
        } : {}),
      }) as TPickRet<T[K]>),
      _schema: schema,
    };
  }

  /**
   * Setup the "getNew" function
   */
  private setupGetNew<T>(
    schema: TModelSchema<T>,
    typeMap: Record<string, IProcessedType>,
  ) {
    const cloneFn = this.cloneFn;
    return (arg: Partial<T> = {}): T => {
      // Loop array
      const retVal = {} as any;
      for (const key in schema) {
        const pObj = typeMap[key],
          val = arg[key];
        // If the value is null and the property is optional, skip adding it
        if (val === null && pObj.optional) {
          continue;
        }
        // If its not there
        if (!(key in arg) || val === undefined) {
          if (!pObj.optional) {
            retVal[key] = pObj.getDefault();
          }
          continue;
        }
        // Apply the transform function
        if (!!pObj.transform) {
          (arg as any)[key] = pObj.transform(val);
        }
        // Validate and add
        if (validateProp(pObj, arg[key])) {
          retVal[key] = cloneFn(arg[key], pObj.isDate);
        }
      }
      // Return
      return retVal;
    };
  }

  /**
   * Test an object schema
   */
  public test<T>(schema: TTestFnSchema<T>) {
    const typeMap: Record<string, IProcessedType> = {};
    for (const key in schema) {
      const schemaKey = schema[key];
      typeMap[key] = processType(key, schemaKey, this.cloneFn);
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
    } else if (isObj(arg)) {
      return structuredClone(arg);
    } else {
      return arg;
    }
  };
}


// **** Export **** //

export default ModelInitializer;
