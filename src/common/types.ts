// **** Types **** //

export type TBasicTypes = 
  'string' |'string[]' | '?string' | '?string[]' |
  'number' | 'number[]' | '?number' | '?number[]' |
  'boolean' | 'boolean[]' | '?boolean' | '?boolean[]' |
  'date' | 'date[]' | '?date' | '?date[]' |
  'email' | 'email[]' | '?email' | '?email[]'

export type TAllTypes = TBasicTypes | 
  'object' | '?object' | 'object[]' | '?object[]' | 
  'pk' | 'fk';

export type TVldrFn<T,K extends keyof T> = (arg: unknown) => arg is T[K];

// BaseTypes
export type TModelSchema<T> = {
  [K in keyof T]: 
  // Base types
  TBasicTypes | 'pk' | 'fk' | {
    type: TBasicTypes; 
    nullable?: boolean;
    default?: T[K];
    vldrFn?: TVldrFn<T,K>;
  // If the type is an object and it's not an optional property or array, 
  // then you must supply a default value.
  } | {
    type: 'object'; 
    nullable?: boolean;
    default: T[K];
    vldrFn: TVldrFn<T,K>;
  // For the other object types, default is not required but validator 
  // still is.
  } | {
    type: '?object' | 'object[]' | '?object[]'; 
    nullable?: boolean;
    default?: T[K];
    vldrFn: TVldrFn<T,K>;
  // Foreign Keys
  } | {
    type: 'fk';
    nullable?: boolean;
    default?: null | -1;
  }
};


// **** User Custom Stuff **** //

export interface ITimeCloneFns {
  cloneDeep: <T>(arg: T) => T;
  validateTime: <T>(arg: T) => boolean;
  toDate: <T>(arg: T) => Date;
}
