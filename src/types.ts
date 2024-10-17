// **** Model-Schema Types **** //

type Flatten<T> = (T extends any[] ? T[number] : NonNullable<T>);
type Refine<Prop> = (arg: unknown) => arg is Prop;
type Transform<Prop> = (arg: unknown) => Prop;
export type TRange = ['<' | '>' | '<=' | '>=', number] | [number, number];

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
  transform?: (
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
} & (Flatten<Prop> extends number ? {
  range?: TRange,
} : {});

// Setup Utility Types
type TSetupArr<Prop, ArrType, Base> = 
  [] extends Prop 
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
type TNum<Prop> = TSetupTypes<Prop, '?num[] | null', 'num[] | null', '?num | null', 'num | null', '?num[]', '?num', 'num[]', 'num'>;
type TNumPos<Prop> = TSetupTypes<Prop, '?num+[] | null', 'num+[] | null', '?num+ | null', 'num+ | null', '?num+[]', '?num+', 'num+[]', 'num+'>;
type TNumNeg<Prop> = TSetupTypes<Prop, '?num-[] | null', 'num-[] | null', '?num- | null', 'num- | null', '?num-[]', '?num-', 'num-[]', 'num-'>;
type TStr<Prop> = TSetupTypes<Prop, '?str[] | null', 'str[] | null', '?str | null', 'str | null', '?str[]', '?str', 'str[]', 'str'>;
type TStrf<Prop> = TSetupTypes<Prop, '?strf[] | null', 'strf[] | null', '?strf | null', 'strf | null', '?strf[]', '?strf', 'strf[]', 'strf'>;
type TDate<Prop> = TSetupTypes<Prop, '?date[] | null', 'date[] | null', '?date | null', 'date | null', '?date[]', '?date', 'date[]', 'date'>;
type TEmail<Prop> = TSetupTypes<Prop, '?email[] | null', 'email[] | null', '?email | null', 'email | null', '?email[]', '?email', 'email[]', 'email'>;
type TColor<Prop> = TSetupTypes<Prop, '?color[] | null', 'color[] | null', '?color | null', 'color | null', '?color[]', '?color', 'color[]', 'color'>;
type TObj<Prop> = TSetupTypes<Prop, '?obj[] | null', 'obj[] | null', '?obj | null', 'obj | null', '?obj[]', '?obj', 'obj[]', 'obj'>;
type TObjWithoutBase<Prop> = TSetupTypes<Prop, '?obj[] | null', 'obj[] | null', '?obj | null', 'obj | null', '?obj[]', '?obj', 'obj[]', never>;


// **** Types for "init" function **** //

// Setup full types
type TBoolFull<Prop> = TBool<Prop> | TTypeObj<Prop, TBool<Prop>>;
type TNumFull<Prop> = TNum<Prop> | TTypeObj<Prop, TNum<Prop>> | TNumNeg<Prop> | TTypeObj<Prop, TNumNeg<Prop>> | TNumPos<Prop> | TTypeObj<Prop, TNumPos<Prop>>;
type TStrFull<Prop> = TStr<Prop> | TTypeObj<Prop, TStr<Prop>> | TStrf<Prop> | TTypeObj<Prop, TStrf<Prop>>;
type TDateFull<Prop> = TDate<Prop> | TTypeObj<Prop, TDate<Prop>>;
type TEmailFull<Prop> = TEmail<Prop> | TTypeObj<Prop, TEmail<Prop>>;
type TColorFull<Prop> = TColor<Prop> | TTypeObj<Prop, TColor<Prop>>;
type TRelKeyFull<Prop> = 'pk' | (null extends Prop ? ('fk | null' | { type: 'fk | null', default: null }) : 'fk');

type TObjFull<Prop> = {
  type: TObj<Prop>,
  props: TModelSchema<Prop>,
  transform?: (Transform<Prop> | 'json'),
} | {
  type: TObjWithoutBase<Prop>,
  refine: Refine<Prop>,
  transform?: (Transform<Prop> | 'json'),
} | {
  type: 'obj',
  refine: Refine<Prop>,
  default: Prop,
  transform?: (Transform<Prop> | 'json'),
};

type TModelSchemaOpts<Prop> = (
  Flatten<Prop> extends boolean
  ? TBoolFull<Prop>
  : Flatten<Prop> extends number
  ? (TNumFull<Prop> | TRelKeyFull<Prop>)
  : Flatten<Prop> extends string
  ? (TStrFull<Prop> | TEmailFull<Prop> | TColorFull<Prop>)
  : Flatten<Prop> extends Date
  ? TDateFull<Prop>
  : Flatten<Prop> extends object
  ? TObjFull<Prop>
  : never
)

export type TModelSchema<T> = {
  [K in keyof T]: TModelSchemaOpts<T[K]>;
};

// Return value for the pick function
export type TPickRet<T> = ({
  vldt: (arg: unknown) => arg is Exclude<T, undefined>,
  default: () => Exclude<T, undefined>,
}) & (T extends Record<string, unknown> ? {
  pick: <K extends keyof T>(k: K) => TPickRet<T[K]>,
} : {});


// **** Types for "test" function **** //

export type TTestFnSchema<T> = {
  [K in keyof T]: Exclude<TModelSchemaOpts<T[K]>, 'default'>;
};
