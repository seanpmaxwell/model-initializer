import { TRange } from './types';


interface ISchemaType {
  type: string;
  transform?: ((arg: unknown) => typeof arg) | 'auto' | 'json';
  refine?: ((arg: unknown) => boolean) | string[] | number[];
  range?: TRange;
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
  transform?: (arg: unknown) => typeof arg;
  refine?: (arg: unknown) => boolean;
  range?: (arg: number) => boolean;
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
    isColor = false,
    range,
    transform;
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
  // Is nullable
  if (type.endsWith(' | null')) {
    nullable = true;
    type = type.slice(0, type.length - 7);
  }
  // Is optional
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
  // Other types
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
  // Setup transform
  if (typeof schemaType === 'object' && 'transform' in schemaType) {
    if (typeof schemaType.transform === 'function') {
      transform = schemaType.transform; 
    } else if (schemaType.transform === 'auto') {
      if (type === 'string') {
        transform = (arg: any) => String(arg);
      } else if (type === 'number') {
        transform = (arg: any) => Number(arg);
      } else if (type === 'boolean') {
        transform = (arg: any) => Boolean(arg);
      }
    } else if (schemaType.transform === 'json') {
      transform = (arg: any) => JSON.parse(arg);
    }
  }
  // Setup range
  if (typeof schemaType === 'object' && !!schemaType.range) {
    range = _processRange(schemaType.range)
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
    transform,
    range,
  };
}

/**
 * Get the range function
 */
function _processRange(range: TRange): (arg: number) => boolean {
  if (range === 'pos') {
    return (arg: number) => arg >= 0;
  } else if (range === 'neg') {
    return (arg: number) => arg < 0;
  } else if (isNum(range[0]) && isNum(range[1])) {
    let a = range[0],
      b = range[1];
    if (a > b) {
      const temp = a;
      a = b;
      b = temp;
    }
    return (arg: number) => (arg >= a && arg <= b);
  } else if (isNum(range[1]) && typeof range[0] === 'string') {
    if (range[0] === '<') {
      return (arg: number) => arg < range[1];
    } else if (range[0] === '<=') {
      return (arg: number) => arg <= range[1];
    } else if (range[0] === '>') {
      return (arg: number) => arg > range[1];
    } else if (range[0] === '>=') {
      return (arg: number) => arg >= range[1];
    }
  }
  throw new Error('Should not reach this point')
}

function isNum(arg: unknown): arg is number {
  return typeof arg === 'number';
}


// **** Export default **** //

export default processType;
