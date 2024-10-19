import { Transform, TModelSchema, TModelSchemaOpts, TObjFull, TPrimitiveTypeObj, Flatten, Refine } from "./types";


// **** Enforce types **** //

export type TInferObj = {
  [key: string]: TAllTypes | TFullTypeObj;
}

// Setup the type object ("distributive-object-type")
type TFullTypeObj = {
  [P in TAllTypes]: (
    P extends TAllObjTypes 
    ? TCustomObjType<P> 
    : TPrimitiveTypeObj<TTypeMap<P>, P>
  );
}[TAllTypes];

type TCustomObjType<Prop> = {
  type: Prop,
  trans?: (Transform<Prop> | 'json'),
  props: TInferObj,
} | ({
  type: Prop,
  trans?: (Transform<Prop> | 'json'),
  refine: Refine<Flatten<Prop>>,
} & (undefined extends Prop ? {
  default?: Prop
} : {
  default: Prop
}))

// type TIterTypeObj = {
//   [P in TAllObjTypes]: (
//     P extends TAllObjTypes 
//     ? TCustomObjType<P> 
//     : TPrimitiveTypeObj<TTypeMap<P>, P>
//   );
// }[TAllObjTypes];


// **** The "inferTypes" function **** //

export type inferTypes<T> = 
  '_schema' extends keyof T 
  ? inferTypesHelper<T['_schema']> 
  : never;

type inferTypesHelper<T> = {
  [K in keyof T]: (
    T[K] extends string 
      ? TTypeMap<T[K]> 
      : 'props' extends keyof T[K] 
      ? (T[K]['props'] extends TModelSchemaOpts<T[K]['props']> ? T[K]['props'] : never)
      : 'type' extends keyof T[K] 
      ? TTypeMap<T[K]['type']> 
      : never
    );
}


// **** All Base Types **** //

type TAllTypes = '?bool[] | null' | 'bool[] | null' | '?bool | null' | 'bool | null' | '?bool[]' | '?bool' | 'bool[]' | 'bool' |
  '?date[] | null' | 'date[] | null' | '?date | null' | 'date | null' | '?date[]' | '?date' | 'date[]' | 'date' |
  '?num[] | null' | 'num[] | null' | '?num | null' | 'num | null' | '?num[]' | '?num' | 'num[]' | 'num' |
  '?str[] | null' | 'str[] | null' | '?str | null' | 'str | null' | '?str[]' | '?str' | 'str[]' | 'str' | 
  '?obj[] | null' | 'obj[] | null' | '?obj | null' | 'obj | null' | '?obj[]' | '?obj' | 'obj[]' | 'obj';

type TAllObjTypes = '?obj[] | null' | 'obj[] | null' | '?obj | null' | 'obj | null' | '?obj[]' | '?obj' | 'obj[]' | 'obj';

type TTypeMap<T> = 
  T extends '?bool[] | null' ? boolean[] | undefined | null : 
  T extends 'bool[] | null' ? boolean[] | null :
  T extends '?bool | null' ? boolean | null | undefined :
  T extends 'bool | null' ? boolean | null :
  T extends '?bool[]' ? boolean | [] :
  T extends '?bool' ? boolean | undefined :
  T extends 'bool[]' ? boolean[] :
  T extends 'bool' ? boolean :
  T extends '?num[] | null' ? number[] | undefined | null : 
  T extends 'num[] | null' ? number[] | null :
  T extends '?num | null' ? number | null | undefined :
  T extends 'num | null' ? number | null :
  T extends '?num[]' ? number | [] :
  T extends '?num' ? number | undefined :
  T extends 'num[]' ? number[] :
  T extends 'num' ? number : 
  T extends '?str[] | null' ? string[] | undefined | null : 
  T extends 'str[] | null' ? string[] | null :
  T extends '?str | null' ? string | null | undefined :
  T extends 'str | null' ? string | null :
  T extends '?str[]' ? string | [] :
  T extends '?str' ? string | undefined :
  T extends 'str[]' ? string[] :
  T extends 'str' ? string : 
  T extends '?date[] | null' ? Date[] | undefined | null : 
  T extends 'date[] | null' ? Date[] | null :
  T extends '?date | null' ? Date | null | undefined :
  T extends 'date | null' ? Date | null :
  T extends '?date[]' ? Date | [] :
  T extends '?date' ? Date | undefined :
  T extends 'date[]' ? Date[] :
  T extends 'date' ? Date : 
  T extends '?obj[] | null' ? object[] | undefined | null : 
  T extends 'obj[] | null' ? object[] | null :
  T extends '?obj | null' ? object | null | undefined :
  T extends 'obj | null' ? object | null :
  T extends '?obj[]' ? object | [] :
  T extends '?obj' ? object | undefined :
  T extends 'obj[]' ? object[] :
  T extends 'obj' ? object : never;

