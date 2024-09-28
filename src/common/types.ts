// **** Types **** //

type TAllStr = 'string' |'string[]' | '?string' | '?string[]';
type TAllNum = 'number' | 'number[]' | '?number' | '?number[]';
type TAllObj = 'object' | '?object' | 'object[]' | '?object[]';

export type TBasicTypes = TAllStr | TAllNum |
  'boolean' | 'boolean[]' | '?boolean' | '?boolean[]' |
  'date' | 'date[]' | '?date' | '?date[]' |
  'email' | 'email[]' | '?email' | '?email[]' |
  'color' | 'color[]' | '?color' | '?color[]';

export type TAllTypes = TBasicTypes | 'fk' | 'pk' | TAllObj;
export type TRefine<T,K extends keyof T> = (arg: unknown) => arg is T[K];

// BaseTypes
export type TModelSchema<T> = {
  [K in keyof T]: 
  // Base types
  TBasicTypes | 'pk' | 'fk' | {
    type: TBasicTypes; 
    nullable?: boolean;
    default?: T[K];
    refine?: TRefine<T,K>;
  // If the type is an object and it's not an optional property, array, or 
  // nullable, then you must supply a default value. 
  } | {
    type: 'object'; 
    nullable?: false;
    default: T[K];
    refine: TRefine<T,K>;
  // Allow nullable objects to have optional default
  } | {
    type: 'object'; 
    nullable: true;
    default?: T[K];
    refine: TRefine<T,K>;
  // For the other object types, default is not required but refine 
  // still is.
  } | {
    type: '?object' | 'object[]' | '?object[]'; 
    nullable?: boolean;
    default?: T[K];
    refine: TRefine<T,K>;
  // Allow nullable setting for fk
  } | {
    type: 'fk',
    nullable?: boolean;
    default?: T[K];
  // Refine using string array
  } | {
    type: TAllStr;
    nullable?: boolean;
    default?: boolean;
    refine: string[];
  // Refine using number array
  } | {
    type: TAllNum;
    nullable?: boolean;
    default?: boolean;
    refine: number[];
  }
};

// Simplified schema for the test.obj function
export type TTestObjFnSchema<T> = {
  [K in keyof T]: TBasicTypes | {
    type: TBasicTypes;
    nullable?: boolean;
    refine?: TRefine<T,K>;
  } | {
    type: TAllObj;
    nullable?: boolean;
    refine: TRefine<T,K>;
  } | {
    type: TAllStr;
    nullable?: boolean;
    refine: string[];
  // Refine using number array
  } | {
    type: TAllNum;
    nullable?: boolean;
    refine: number[];
  }
};

// **** User Custom Stuff **** //

export interface ITimeCloneFns {
  cloneDeep: <T>(arg: T) => T;
  validateTime: <T>(arg: T) => boolean;
  toDate: <T>(arg: T) => Date;
}
