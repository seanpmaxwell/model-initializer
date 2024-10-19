import StringFormats from './StringFormats';


// **** Helpers **** //

// This roots out Record<string,...> and makes sure we use a named type
type TStaticObj<Prop> = string extends keyof Prop ? never : {
  [key: string]: string | number | boolean | TStaticObj<Prop>;
};
type TConvertInterToType<Prop> = {
  [K in keyof Prop]: Prop[K];
}
type IsStaticObj<Prop> = TConvertInterToType<Prop> extends TStaticObj<Prop> ? true : false;

// Some Utility Types
export type TEnum = Record<string, string | number>;
type Flatten<T> = (T extends unknown[] ? T[number] : NonNullable<T>);
type NotUndef<T> = Exclude<T, undefined>;
type NotNull<T> = Exclude<T, null>
type Refine<Prop> = (arg: unknown) => arg is Prop;
type Transform<Prop> = (arg: unknown) => Prop;
export type TRange = ['<' | '>' | '<=' | '>=', number] | [number, number] | '+' | '-';


// **** Setup Schema Types **** //

// Setup the type object
export type TPrimTypeObj<Prop, TType> = {
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
  NonNullable<Prop> extends unknown[]
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

// Primitive types
type TBoolFull<Prop> = TBool<Prop> | TPrimTypeObj<Prop, TBool<Prop>>;
type TNumFull<Prop> = TNum<Prop> | TPrimTypeObj<Prop, TNum<Prop>>;
type TStrFull<Prop> = TStr<Prop> | TPrimTypeObj<Prop, TStr<Prop>>;
type TDateFull<Prop> = TDate<Prop> | TPrimTypeObj<Prop, TDate<Prop>>;
type TRelKeyFull<Prop> = 'pk' | (null extends Prop ? ('fk | null' | { type: 'fk | null', default: null }) : 'fk');

type TObjFull<Prop> = (IsStaticObj<Flatten<Prop>> extends true ? {
  type: TObj<Prop>,
  trans?: (Transform<Prop> | 'json'),
  props: TModelSchema<Flatten<Prop>>,
} : ({
  type: TObj<Prop>,
  trans?: (Transform<Prop> | 'json'),
  refine: Refine<Flatten<Prop>>,
} & (undefined extends Prop ? {
  default?: Prop
} : {
  default: Prop
})));


type TEnumFull<Prop> = Prop extends (string | number) ? {
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
  [K in keyof T]: TModelSchemaOpts<T[K]> | TEnumFull<T[K]>;
};

export type TPickRet<T> = ({
  vldt: (arg: unknown) => arg is NotUndef<T>,
  default: () => NotUndef<T>,
}) & (IsStaticObj<Flatten<T>> extends true ? null extends T ? {
  pick?: <K extends keyof NonNullable<T>>(key: K) => TPickRet<NonNullable<T>[K]>,
} : undefined extends T ? {
  pick?: <K extends keyof NotUndef<T>>(key: K) => TPickRet<NotUndef<T>[K]>,
} : {
  pick: <K extends keyof T>(key: K) => TPickRet<T[K]>,
} : {});


// **** Types for "test" function **** //

export type TTestFnSchema<T> = {
  [K in keyof T]: Exclude<TModelSchemaOpts<T[K]>, 'default'>;
};
