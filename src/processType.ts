import Regexes from './Regexes';
import { TRange } from './types';


// **** Type Map **** //

const TYPE_MAP = {
  bool: 'boolean',
  str: 'string',
  strf: 'string',
  num: 'number',
  ['num+']: 'number',
  ['num-']: 'number',
  obj: 'object',
  color: 'color',
  email: 'email',
  date: 'date',
  pk: 'number',
  fk: 'number',
} as const;


// **** Types **** //

interface ISchemaType {
  type: string;
  transform?: ((arg: unknown) => typeof arg) | 'auto' | 'json';
  refine?: ((arg: unknown) => boolean) | string[] | number[];
  range?: TRange;
  default?: unknown;
}

export interface ITypeObj {
  propName: string;
  type: string;
  origType: string;
  optional: boolean;
  nullable: boolean;
  isArr: boolean;
  isDate: boolean;
  default: unknown;
  transform?: (arg: unknown) => typeof arg;
  refine?: (arg: unknown) => boolean;
  _refine?: (arg: unknown) => boolean;
  range?: (arg: number) => boolean;
}


// **** Functions **** //

/**
 * Process the value on a schema object. 
 */
function processType(
  key: string,
  schemaType: string | ISchemaType,
): ITypeObj  {
  // Init
  let type = '',
    origType = '',
    nullable = false,
    isArr = false,
    isDate = false,
    optional = false,
    refine,
    _refine,
    _default = undefined,
    range,
    transform;
  // Type could be string or object
  if (typeof schemaType === 'string') {
    type = schemaType;
    origType = type;
  } else if (typeof schemaType === 'object') {
    type = schemaType.type;
    origType = schemaType.type;
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
  // Check some special types
  if (type === 'num+') {
    _refine = _processRange(['>=', 0]);
  } else if (type === 'num-') {
    _refine = _processRange(['<', 0]);
  } else if (type === 'strf') {
    _refine = (arg: unknown) => arg !== '';
  } else if (type === 'email') {
    _refine = Regexes.email;
  } else if (type === 'date') {
    isDate = true;
  } else if (type === 'color') {
    _refine = Regexes.color;
  }
  // Get non-abbreviated type
  type = (TYPE_MAP as any)[type];
  // Setup transform
  if (typeof schemaType === 'object') {
    // Setup refine
    if (!!schemaType.refine) {
      const refine_ = schemaType.refine; 
      if (typeof refine_ === 'function') {
        refine = refine_;
      } else if (Array.isArray(refine_) && refine_.length > 0) {
        refine = (arg: unknown) => refine_.some(item => item === arg);
      }
    }
    // Setup range
    if (!!schemaType.range) {
      range = _processRange(schemaType.range)
    }
    // Transform
    if (schemaType.transform) {
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
  }
  // Setup default val
  if (typeof schemaType === 'object' && schemaType.default !== undefined) {
    _default = schemaType.default
  } else if (type === 'object' && nullable) {
    _default = null;
  } else {
    _default = _getDefault(type, origType, isArr);
  }
  // Return
  return {
    propName: key,
    isArr,
    optional,
    type,
    origType,
    nullable,
    default: _default,
    isDate,
    refine,
    _refine,
    transform,
    range,
  };
}

/**
 * Get the default value non including relational keys. Note we don't do "date" 
 * here cause that needs to be a new date at the time "new()" is called.
 */
function _getDefault(type: string, origType: string, isArr: boolean) {
  if (isArr) {
    return [];
  } else if (origType === 'strf') { 
    return '--';
  } else if (type === 'string' || type === 'email') {
    return '';
  } else if (type === 'number') {
    return 0;
  } else if (type === 'boolean') {
    return false;
  } if (type === 'pk' || type === 'fk') {
    return -1;
  } else if (type === 'color') {
    return '#FFFFFF';
  }
}

/**
 * Get the range function
 */
function _processRange(range: TRange): (arg: unknown) => boolean {
  const left = range[0], right = range[1];
  if (isNum(left) && isNum(right)) {
    if (left < right) {
      return (arg: unknown) => isNum(arg) && (arg >= left && arg <= right);
    } else {
      return (arg: unknown) => isNum(arg) && (arg >= left || arg <= right);
    }
  } else if (isNum(right) && typeof left === 'string') {
    if (left === '<') {
      return (arg: unknown) => isNum(arg) && arg < right;
    } else if (left === '<=') {
      return (arg: unknown) => isNum(arg) && arg <= right;
    } else if (left === '>') {
      return (arg: unknown) => isNum(arg) && arg > right;
    } else if (left === '>=') {
      return (arg: unknown) => isNum(arg) && arg >= right;
    }
  }
  throw new Error('Should not reach this point')
}

function isNum(arg: unknown): arg is number {
  return typeof arg === 'number';
}


// **** Export default **** //

export default processType;
