// **** Types **** //

type TAllBool = 'boolean' | 'boolean[]' | '?boolean' | '?boolean[]' | 
  'boolean | null' | 'boolean[] | null' | '?boolean | null' | '?boolean[] | null';

type TAllDate = 'date' | 'date[]' | '?date' | '?date[]' | 
  'date | null' | 'date[] | null' | '?date | null' | '?date[] | null';

type TAllEmail = 'email' | 'email[]' | '?email' | '?email[]' | 
  'email | null' | 'email[] | null' | '?email | null' | '?email[] | null';

type TAllColor = 'color' | 'color[]' | '?color' | '?color[]' | 
  'color | null' | 'color[] | null' | '?color | null' | '?color[] | null';

type TAllStr = 'string' |'string[]' | '?string' | '?string[]' | 
  'string | null' |'string[] | null' | '?string | null' | '?string[] | null';

type TAllNum = 'number' | 'number[]' | '?number' | '?number[]' | 
  'number | null' | 'number[] | null' | '?number | null' | '?number[] | null';

type TRemObj = '?object' | 'object[]' | '?object[]' | 
  'object | null' | '?object | null' | 'object[] | null' | '?object[] | null';

type TAllFk = 'fk' | 'fk | null';

export type TBasicTypes = TAllStr | TAllNum | TAllBool | TAllDate | TAllEmail | TAllColor;
export type TAllTypes = TBasicTypes | TAllFk | 'pk' | 'object' | TRemObj;
export type TRefine<T,K extends keyof T> = (arg: unknown) => arg is T[K];

// BaseTypes
export type TModelSchema<T> = {
  [K in keyof T]: 
  // Base types
  TBasicTypes | 'pk' | 'fk' | {
    type: TBasicTypes | 'fk'; 
    default?: T[K];
    refine?: TRefine<T,K>;
  // For base object-type, you must supply a default value. 
  } | {
    type: 'object'; 
    default: T[K];
    refine: TRefine<T,K>;
  // Allow other object types to have optional default, refine still required
  } | {
    type: TRemObj; 
    default?: T[K];
    refine: TRefine<T,K>;
  // Refine using string array
  } | {
    type: TAllStr;
    default?: boolean;
    refine: string[];
  // Refine using number array
  } | {
    type: TAllNum;
    default?: boolean;
    refine: number[];
  // If fk is nullable, allow null as default
  } | {
    type: 'fk | null'; 
    default?: -1 | null;
  }
};

// Simplified schema for the test.obj function
export type TTestObjFnSchema<T> = {
  [K in keyof T]: TBasicTypes | {
    type: TBasicTypes;
    refine?: TRefine<T,K>;
  } | {
    type: 'object' | TRemObj;
    refine: TRefine<T,K>;
  } | {
    type: TAllStr;
    refine: string[];
  } | {
    type: TAllNum;
    refine: number[];
  }
};

// **** User Custom Stuff **** //

export interface ITimeCloneFns {
  cloneDeep: <T>(arg: T) => T;
  validateTime: <T>(arg: T) => boolean;
  toDate: <T>(arg: T) => Date;
}
