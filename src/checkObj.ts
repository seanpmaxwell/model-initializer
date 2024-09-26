import { ITimeCloneFns, TBasicTypes, TVldrFn } from './common/types';
import { validateObj } from './common/validator-fns';


// **** Types **** //

// Validator function is required for objects.
export type TObjSchema<T> = {
  [K in keyof T]: TBasicTypes | {
    type: TBasicTypes;
    nullable?: boolean;
    vldrFn?: TVldrFn<T,K>;
  } | {
    type: 'object' | '?object' | 'object[]' | '?object[]';
    nullable?: boolean;
    vldrFn: TVldrFn<T,K>;
  }
};


// **** Functions **** //

/**
 * Check object function
 */
function checkObj<T>(
  schema: TObjSchema<T>,
  timeCloneFns: ITimeCloneFns,
): (arg: unknown) => arg is NonNullable<T> {
  const validate = validateObj<T>(schema, timeCloneFns);
  return (arg: unknown): arg is NonNullable<T> => validate(arg);
}


// **** Export default **** //

export default checkObj;
