import setupGetNew from './setupGetNew';
import setupValidator from './setupValidator';
import { TModelProp } from './common/types';
import checkObject from './checkObj';


// **** Setup **** //

interface IModelFns<T> {
  isValid: (arg: unknown) => arg is T;
  new: (arg?: Partial<T>) => T;
}

function init<T>(props: TModelProp<T>[]): IModelFns<T> {
  const validate = setupValidator<T>(props),
    getNew = setupGetNew<T>(props);
  return {
    isValid(arg: unknown): arg is T {
      return validate(arg);
    },
    new(arg?: Partial<T>): T {
      return getNew(arg);
    },
  };
}


// **** Export default **** //

export default {
  init,
  checkObject,
} as const;
