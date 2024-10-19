import ModelInitializerClass from './ModelInitializer';
import { TTestFnSchema } from './types';


export type TObjSchema<T> = TTestFnSchema<T>;
export const ModelInitializer = ModelInitializerClass;
export default new ModelInitializerClass();
export { inferTypes } from './inferTypes';
