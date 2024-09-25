// **** Types **** //

export type TBasicTypes = 
  'string' |'string[]' | '?string' | '?string[]' |
  'number' | 'number[]' | '?number' | '?number' |
  'boolean' | 'boolean[]' | '?boolean' | '?boolean[]' |
  'date' | 'date[]' | '?date' | '?date[]';

export type TAllTypes = 
  TBasicTypes | 
  'object' | '?object' | 'object[]' | '?object[]' | 
  'pk' | 'fk';

export type TVldrFn<T,K extends keyof T> = (arg: unknown) => arg is T[K]; 

type TBaseTypeModelProp<T> = {
  [K in keyof T]: {
    prop: K,
    type: TBasicTypes;
    nullable?: boolean;
    default?: T[K];
    vldrFn?: TVldrFn<T,K>;
  }
}[keyof T];

// If the type is an object and it's not an optional property or array, 
// then you must supply a default value.
type TObjModelProp<T> = {
  [K in keyof T]: {
    prop: K,
    type: 'object';
    nullable?: boolean;
    default: T[K];
    vldrFn: TVldrFn<T,K>;
  }
}[keyof T]

// For the other object types, default is not required but validator still is.
type TOtherObjModelProp<T> = {
  [K in keyof T]: {
    prop: K,
    type: '?object' | 'object[]' | '?object[]';
    nullable?: boolean;
    default?: T[K];
    vldrFn: TVldrFn<T,K>;
  }
}[keyof T]

// Primary key cannot be null and must be specified or have default value -1
type TPrimaryKeyModelProp<T> = {
  [K in keyof T]: {
    prop: K,
    type: 'pk';
  }
}[keyof T];

// Foreign key is like the primary key but it can be null
type TForeignKeyModelProp<T> = {
  [K in keyof T]: {
    prop: K,
    type: 'fk';
    nullable?: boolean;
    default?: null | -1;
  }
}[keyof T];


// **** Composite Types **** //

export type TModelPropNotFks<T> = 
  TBaseTypeModelProp<T> | 
  TObjModelProp<T> | 
  TOtherObjModelProp<T>;
  
export type TModelProp<T> = 
  TModelPropNotFks<T> | 
  TForeignKeyModelProp<T> | 
  TPrimaryKeyModelProp<T>;


// **** User Custom Stuff **** //

export interface ITimeCloneFns {
  cloneDeep: <T>(arg: T) => T;
  validateTime: <T>(arg: T) => boolean;
  toDate: <T>(arg: T) => Date;
}
