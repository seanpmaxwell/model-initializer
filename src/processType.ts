import { isNum, isObj } from './misc';
import ModelInitializer from './ModelInitializer';
import Regexes from './Regexes';
import { TRange, } from './types';


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

interface ITypeObj {
  type: string;
  transform?: ((arg: unknown) => typeof arg) | 'auto' | 'json';
  refine?: ((arg: unknown) => boolean) | string[] | number[];
  range?: TRange;
  default?: unknown;
  schema?: object;
}

export interface IProcessedType {
  propName: string;
  type: string;
  origType: string;
  optional: boolean;
  nullable: boolean;
  isArr: boolean;
  isDate: boolean;
  getDefault: () => unknown;
  transform?: (arg: unknown) => typeof arg;
  refine?: (arg: unknown) => boolean;
  _refine?: (arg: unknown) => boolean;
  range?: (arg: number) => boolean;
  pick?: (arg: 'string') => object;
}


// **** Functions **** //

/**
 * Process the value on a schema object. 
 */
function processType(
  key: string,
  typeProp: string | ITypeObj,
  cloneFn: (val: unknown, isDate: boolean) => unknown,
): IProcessedType  {
  // Init
  let type = '',
    origType = '',
    nullable = false,
    isArr = false,
    isDate = false,
    optional = false,
    refine,
    _refine,
    getDefault = () => {},
    range,
    pick,
    transform;
  // Type could be string or object
  if (typeof typeProp === 'string') {
    type = typeProp;
    origType = type;
  } else if (isObj(typeProp)) {
    type = typeProp.type;
    origType = typeProp.type;
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
  if (isObj(typeProp)) {
    // Setup refine
    if (!!typeProp.refine) {
      const refine_ = typeProp.refine; 
      if (typeof refine_ === 'function') {
        refine = refine_;
      } else if (Array.isArray(refine_) && refine_.length > 0) {
        refine = (arg: unknown) => refine_.some(item => item === arg);
      }
    }
    // Setup range
    if (!!typeProp.range) {
      range = _processRange(typeProp.range)
    }
    // Transform
    if (typeProp.transform) {
      if (typeof typeProp.transform === 'function') {
        transform = typeProp.transform; 
      } else if (typeProp.transform === 'auto') {
        if (type === 'string') {
          transform = (arg: any) => String(arg);
        } else if (type === 'number') {
          transform = (arg: any) => Number(arg);
        } else if (type === 'boolean') {
          transform = (arg: any) => Boolean(arg);
        }
      } else if (typeProp.transform === 'json') {
        transform = (arg: any) => JSON.parse(arg);
      }
    }
    // Setup default val
    if (typeProp.default !== undefined) {
      getDefault = () => cloneFn(getDefault, isDate);
    } else if (type === 'object' && nullable) {
      getDefault = () => null;
    } else {
      getDefault = () => _getDefault(type, origType, isArr);
    }
    // Process "schema" type
    if (type === 'schema' && !!typeProp.schema) {
      const schema: any = new ModelInitializer().init(typeProp.schema)
      getDefault = () => schema.new();
      refine = schema.isValid;
      pick = schema.pick;
    }
  }
  // Return
  return {
    propName: key,
    isArr,
    optional,
    type,
    origType,
    nullable,
    getDefault: getDefault,
    pick, 
    isDate,
    refine,
    _refine,
    transform,
    range,
  };
}

/**
 * Get the default value non including relational keys.
 */
function _getDefault(type: string, origType: string, isArr: boolean) {
  if (isArr) {
    return [];
  } else if (type === 'date') {
    return new Date();
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


// **** Export default **** //

export default processType;
