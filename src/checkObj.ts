import { ITimeCloneFns, TBasicTypes, TVldrFn } from './common/types';
import { validateObj } from './common/validator-fns';


// **** Types **** //

// Validator function is required for objects.
export type TObjProp<T> = {
  [K in keyof T]: {
    prop: K,
    type: TBasicTypes;
    optional?: boolean;
    nullable?: boolean;
    vldrFn?: TVldrFn<T,K>;
  } | {
    prop: K,
    type: 'object' | 'object[]';
    optional?: boolean;
    nullable?: boolean;
    vldrFn: TVldrFn<T,K>;
  }
}[keyof T];


// **** Functions **** //

/**
 * Check object function
 */
function checkObj<T>(
  props: TObjProp<T>[],
  timeCloneFns: ITimeCloneFns,
): (arg: unknown) => arg is NonNullable<T> {
  const validate = validateObj<T>(props, timeCloneFns);
  return (arg: unknown): arg is NonNullable<T> => validate(arg);
}


// **** Export default **** //

export default checkObj;
