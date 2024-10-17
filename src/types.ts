import StringFormats from './StringFormats';


// **** Model-Schema Types **** //

export type TEnum = Record<string, string | number>;
type Flatten<T> = (T extends unknown[] ? T[number] : NonNullable<T>);
type Refine<Prop> = (arg: unknown) => arg is Prop;
type Transform<Prop> = (arg: unknown) => Prop;
export type TRange = ['<' | '>' | '<=' | '>=', number] | [number, number] | '+' | '-';

// Setup the type object
export type TTypeObj<Prop, TType> = {
  type: TType;
  default?: Prop;
  refine?: (
    Flatten<Prop> extends string 
    ? (Refine<Prop> | string[])
    : Flatten<Prop> extends number 
    ? (Refine<Prop> | number[])
    : Refine<Prop>
  );
  trans?: (
    NonNullable<Prop> extends string 
    ? (Transform<Prop> | 'auto' | 'json')
    : NonNullable<Prop> extends number 
    ? (Transform<Prop> | 'auto' | 'json')
    : NonNullable<Prop> extends boolean 
    ? (Transform<Prop> | 'auto' | 'json')
    : NonNullable<Prop> extends Date
    ? (Transform<Prop> | 'auto' | 'json')
    : (Transform<Prop> | 'json')
  );
// Add range
} & (Flatten<Prop> extends number ? {
  range?: TRange,
} : {}) &
// Add format
(Flatten<Prop> extends string ? {
  format?: keyof typeof StringFormats,
} : {});

// Setup Utility Types
type TSetupArr<Prop, ArrType, Base> = 
  Prop extends unknown[]
    ? ArrType
    : Base

type TSetupOpt<Prop, OptsAndArr, Opts, Arr, Base> = 
  undefined extends Prop 
    ? TSetupArr<Prop, OptsAndArr, Opts> 
    : TSetupArr<Prop, Arr, Base>;

type TSetupTypes<Prop, NullAndOptAndArr, NullAndArr, NullAndOpt, Null, OptAndArr, Opt, Arr, Base> = 
  null extends Prop 
    ? TSetupOpt<Prop, NullAndOptAndArr, NullAndOpt, NullAndArr, Null>
    : TSetupOpt<Prop, OptAndArr, Opt, Arr, Base>

// Setup Base-Types
type TBool<Prop> = TSetupTypes<Prop, '?bool[] | null', 'bool[] | null', '?bool | null', 'bool | null', '?bool[]', '?bool', 'bool[]', 'bool'>;
type TDate<Prop> = TSetupTypes<Prop, '?date[] | null', 'date[] | null', '?date | null', 'date | null', '?date[]', '?date', 'date[]', 'date'>;
type TNum<Prop> = TSetupTypes<Prop, '?num[] | null', 'num[] | null', '?num | null', 'num | null', '?num[]', '?num', 'num[]', 'num'>;
type TStr<Prop> = TSetupTypes<Prop, '?str[] | null', 'str[] | null', '?str | null', 'str | null', '?str[]', '?str', 'str[]', 'str'>;
type TObj<Prop> = TSetupTypes<Prop, '?obj[] | null', 'obj[] | null', '?obj | null', 'obj | null', '?obj[]', '?obj', 'obj[]', 'obj'>;


// **** Types for "init" function **** //

// Primitive types
type TBoolFull<Prop> = TBool<Prop> | TTypeObj<Prop, TBool<Prop>>;
type TNumFull<Prop> = TNum<Prop> | TTypeObj<Prop, TNum<Prop>>;
type TStrFull<Prop> = TStr<Prop> | TTypeObj<Prop, TStr<Prop>>;
type TDateFull<Prop> = TDate<Prop> | TTypeObj<Prop, TDate<Prop>>;
type TRelKeyFull<Prop> = 'pk' | (null extends Prop ? ('fk | null' | { type: 'fk | null', default: null }) : 'fk');

// Object types
type TObjFull<Prop> = ({
  type: TObj<Prop>,
  trans?: (Transform<Prop> | 'json'),
  props: TModelSchema<Flatten<Prop>>,
});

// The 'any' type
type TAnyFull<Prop> = ({
  type: 'any' | '?any',
  trans?: (Transform<Prop> | 'json'),
  props?: TModelSchema<Prop>,
  refine: Refine<Prop>,
}) & ({
  type: 'any',
  default: Prop,
} | {
  type: '?any',
  default?: Prop,
});

type TEnumFull<Prop> = NonNullable<Prop> extends (string | number) ? {
  type: 'enum' | '?enum',
  refine: TEnum,
  default?: Prop,
} : never;

// Combine all types
type TModelSchemaOpts<Prop> = (
  Flatten<Prop> extends boolean
  ? TBoolFull<Prop>
  : Flatten<Prop> extends number
  ? (TNumFull<Prop> | TRelKeyFull<Prop>)
  : Flatten<Prop> extends string
  ? TStrFull<Prop>
  : Flatten<Prop> extends Date
  ? TDateFull<Prop>
  : Flatten<Prop> extends object
  ? TObjFull<Prop>
  : never
)

// Map the schema to the incoming type
export type TModelSchema<T> = {
  [K in keyof T]: (TModelSchemaOpts<T[K]> | TAnyFull<T[K]> | TEnumFull<T[K]>);
};

// Return value for the pick function
export type TPickRet<T> = ({
  vldt: (arg: unknown) => arg is Exclude<T, undefined>,
  default: () => Exclude<T, undefined>,
// This stops general Record types from using "pick"
}) & (symbol extends keyof T ? {} : number extends keyof T ? {} : string extends keyof T ? {} : T extends Record<string, unknown> ? {
  pick: <K extends keyof T>(k: K) => TPickRet<T[K]>,
} : {});


// **** Types for "test" function **** //

export type TTestFnSchema<T> = {
  [K in keyof T]: Exclude<TModelSchemaOpts<T[K]>, 'default'>;
};
