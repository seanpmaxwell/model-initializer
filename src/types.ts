// **** Model-Schema Types **** //

type Flatten<T> = (T extends any[] ? T[number] : NonNullable<T>);
type Refine<Prop> = (arg: unknown) => arg is Prop;
type Transform<Prop> = (arg: unknown) => Prop;

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
    : (Transform<Prop> | 'json')
  );
}

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
type TBool<Prop> = TSetupTypes<Prop, '?boolean[] | null', 'boolean[] | null', '?boolean | null', 'boolean | null', '?boolean[]', '?boolean', 'boolean[]', 'boolean'>;
type TNum<Prop> = TSetupTypes<Prop, '?number[] | null', 'number[] | null', '?number | null', 'number | null', '?number[]', '?number', 'number[]', 'number'>;
type TStr<Prop> = TSetupTypes<Prop, '?string[] | null', 'string[] | null', '?string | null', 'string | null', '?string[]', '?string', 'string[]', 'string'>;
type TDate<Prop> = TSetupTypes<Prop, '?date[] | null', 'date[] | null', '?date | null', 'date | null', '?date[]', '?date', 'date[]', 'date'>;
type TEmail<Prop> = TSetupTypes<Prop, '?email[] | null', 'email[] | null', '?email | null', 'email | null', '?email[]', '?email', 'email[]', 'email'>;
type TColor<Prop> = TSetupTypes<Prop, '?color[] | null', 'color[] | null', '?color | null', 'color | null', '?color[]', '?color', 'color[]', 'color'>;
type TObj<Prop> = TSetupTypes<Prop, '?object[] | null', 'object[] | null', '?object | null', 'object | null', '?object[]', '?object', 'object[]', never>; 

// Setup full types
type TBoolFull<Prop> = TBool<Prop> | TTypeObj<Prop, TBool<Prop>>;
type TNumFull<Prop> = TNum<Prop> | TTypeObj<Prop, TNum<Prop>>;
type TStrFull<Prop> = TStr<Prop> | TTypeObj<Prop, TStr<Prop>>;
type TDateFull<Prop> = TDate<Prop> | TTypeObj<Prop, TDate<Prop>>;
type TEmailFull<Prop> = TEmail<Prop> | TTypeObj<Prop, TEmail<Prop>>;
type TColorFull<Prop> = TColor<Prop> | TTypeObj<Prop, TColor<Prop>>;
type TRelKeyFull<Prop> = 'pk' | (null extends Prop ? ('fk | null' | { type: 'fk | null', default: null }) : 'fk');

// Setup object full, "Default is required for basic obj"
type TObjFull<Prop> = ({
  type: 'object';
  default: Prop;
} | {
  type: TObj<Prop>;
  default?: Prop;
}) & ({
  refine: Refine<Prop>;
  transform?: (Transform<Prop> | 'json');
});

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

// BaseTypes
export type TModelSchema<T> = {
  [K in keyof T]: TModelSchemaOpts<T[K]>;
};


// **** "test()" Function Types (remove default) **** //

type TBoolFulls<Prop> = TBool<Prop> | Omit<TTypeObj<Prop, TBool<Prop>>, 'default'>;
type TNumFulls<Prop> = TNum<Prop> | Omit<TTypeObj<Prop, TNum<Prop>>, 'default'>;
type TStrFulls<Prop> = TStr<Prop> | Omit<TTypeObj<Prop, TStr<Prop>>, 'default'>;
type TDateFulls<Prop> = TDate<Prop> | Omit<TTypeObj<Prop, TDate<Prop>>, 'default'>;
type TEmailFulls<Prop> = TEmail<Prop> | Omit<TTypeObj<Prop, TEmail<Prop>>, 'default'>;
type TColorFulls<Prop> = TColor<Prop> | Omit<TTypeObj<Prop, TColor<Prop>>, 'default'>;
type TObjs<Prop> = TSetupTypes<Prop, '?object[] | null', 'object | null', '?object | null', 'object | null', '?object[]', '?object', 'object[]', 'object'>; 

// Setup object full
type TObjFulls<Prop> = {
  type: TObjs<Prop>;
  refine: Refine<Prop>;
  transform?: (Transform<Prop> | 'json');
}

type TAllTestOptions<Prop> = (
  Flatten<Prop> extends boolean
  ? TBoolFulls<Prop>
  : Flatten<Prop> extends number
  ? TNumFulls<Prop>
  : Flatten<Prop> extends string
  ? (TStrFulls<Prop> | TEmailFulls<Prop> | TColorFulls<Prop>)
  : Flatten<Prop> extends Date
  ? TDateFulls<Prop>
  : Flatten<Prop> extends object
  ? TObjFulls<Prop>
  : never
) 

export type TTestFnSchema<T> = {
  [K in keyof T]: TAllTestOptions<T[K]>;
};
