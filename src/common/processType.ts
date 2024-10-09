import { TAllTypes } from './types';


interface ISchemaType {
  type: TAllTypes;
  refine?: ((arg: unknown) => boolean) | string[] | number[];
}

export interface ITypeObj {
  propName: string;
  type: string;
  optional: boolean;
  nullable: boolean;
  isArr: boolean;
  isEmail: boolean;
  hasDefault: boolean;
  default: unknown;
  isDate: boolean;
  isRelationalKey: boolean;
  isColor: boolean;
  refine?: (arg: unknown) => boolean;
}

/**
 * Process the value on a schema object. 
 */
function processType(
  key: string,
  schemaType: string | ISchemaType,
): ITypeObj  {
  // Init
  let type = '',
    nullable = false,
    isArr = false,
    optional = false,
    refine,
    isDate = false,
    hasDefault = false,
    isRelationalKey = false,
    isEmail = false,
    _default = undefined,
    isColor = false;
  // Check
  if (!schemaType) {
    throw new Error('schema property should not be falsey')
  }
  // Type could be string or object
  if (typeof schemaType === 'string') {
    type = schemaType;
  } else if (typeof schemaType === 'object') {
    type = schemaType.type;
    // Setup the "refine" function
    if ('refine' in schemaType) {
      const refine_ = schemaType.refine; 
      if (typeof refine_ === 'function') {
        refine = refine_;
      } else if (Array.isArray(refine_) && refine_.length > 0) {
        refine = (arg: unknown) => refine_.some(item => item === arg);
      }
    }
    // Setup the default value
    if ('default' in schemaType) {
      hasDefault = true;
      _default = schemaType.default
    }
  }
  // Is optional
  if (type.endsWith(' | null')) {
    nullable = true;
    type = type.slice(0, type.length - 7);
  }
  if (type.startsWith('?')) {
    optional = true;
    type = type.substring(1);
  }
  // Is array
  if (type.endsWith('[]')) {
    isArr = true;
    type = type.slice(0, type.length - 2);
  }
  if (type === 'fk' || type === 'pk') {
    isRelationalKey = true;
  }
  // other types
  if (type === 'email') {
    isEmail = true;
  } else if (type === 'date') {
    isDate = true;
  } else if (type === 'color') {
    isColor = true;
  } else if (type === 'object' && nullable && _default === undefined) {
    hasDefault = true;
    _default = null;
  }
  // Return
  return {
    propName: key,
    isArr,
    optional,
    type,
    nullable,
    isEmail,
    hasDefault,
    default: _default,
    isDate,
    isRelationalKey,
    isColor,
    refine,
  };
}


// **** Export default **** //

export default processType;
