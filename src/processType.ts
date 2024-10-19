import { getEnumVals, isNum, isObj, nonArrObj } from './util';
import ModelInitializer from './ModelInitializer';
import StringFormats from './StringFormats';
import { TEnum, TRange } from './types';


// **** Type Map **** //

const TYPE_MAP = {
  bool: 'boolean',
  str: 'string',
  num: 'number',
  obj: 'object',
  date: 'Date',
  pk: 'number',
  fk: 'number',
  enum: 'enum',
} as const;


// **** Types **** //

interface ITypeObj {
  type: string;
  trans?: ((arg: unknown) => typeof arg) | 'auto' | 'json';
  refine?: ((arg: unknown) => boolean) | string[] | number[] | TEnum;
  range?: TRange;
  default?: unknown;
  props?: object;
  format?: keyof typeof StringFormats;
}

export interface IProcessedType {
  propName: string;
  type: string;
  rootType: string;
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
  _schema: any;
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
    rootType = '',
    origType = '',
    nullable = false,
    isArr = false,
    isDate = false,
    optional = false,
    refine,
    _refine,
    getDefault,
    range,
    pick,
    transform,
    _schema: any = null;
  // Type could be string or object
  if (typeof typeProp === 'string') {
    type = typeProp;
    origType = type;
    rootType = type;
  } else if (isObj(typeProp)) {
    type = typeProp.type;
    origType = type;
    rootType = type;
  }
  // Is nullable
  if (type.endsWith(' | null')) {
    nullable = true;
    type = type.slice(0, type.length - 7);
    rootType = type;
  }
  // Is optional
  if (type.startsWith('?')) {
    optional = true;
    type = type.substring(1);
    rootType = type;
  }
  // Is array
  if (type.endsWith('[]')) {
    isArr = true;
    type = type.slice(0, type.length - 2);
    rootType = type;
  }
  // Get non-abbreviated type
  type = (TYPE_MAP as any)[type];
  // Check some special types
  if (rootType === 'date') {
    isDate = true;
  }
  // Setup transform
  if (isObj(typeProp)) {
    // Setup refine
    if (!!typeProp.refine) {
      const refine_ = typeProp.refine; 
      if (typeof refine_ === 'function') {
        refine = refine_;
      } else if (Array.isArray(refine_) && refine_.length > 0) {
        refine = (arg: unknown) => refine_.some(item => item === arg);
      // Process enum stuff
      } else if (type === 'enum' && nonArrObj(refine_)) {
        const values = getEnumVals(refine_);
        refine = (arg: unknown) => values.some(item => item === arg);
        if (!!typeProp.default) {
          getDefault = () => typeProp.default;
        } else {
          getDefault = () => values[0];
        }
      }
    }
    // Setup range
    if (!!typeProp.range) {
      range = _processRange(typeProp.range)
    }
    // Transform
    if (!!typeProp.trans) {
      if (typeof typeProp.trans === 'function') {
        transform = typeProp.trans; 
      } else if (typeProp.trans === 'auto') {
        if (type === 'string') {
          transform = (arg: any) => String(arg);
        } else if (type === 'number') {
          transform = (arg: any) => Number(arg);
        } else if (type === 'boolean') {
          transform = (arg: any) => Boolean(arg);
        } else if (type === 'Date') {
          transform = (arg: any) => new Date(arg);
        }
      } else if (typeProp.trans === 'json') {
        transform = (arg: any) => JSON.parse(arg);
      }
    }
    // Process nested schemas type
    if (type === 'object' && !!typeProp.props) {
      if (Object.keys(typeProp.props).length > 0) {
        _schema = new ModelInitializer().init(typeProp.props as any);
        getDefault = () => _schema.new();
        refine = _schema.isValid;
        pick = _schema.pick;
      } else {
        getDefault = () => {};
        refine = (arg: unknown) => (!!arg && typeof arg === 'object' && Object.keys(arg).length === 0);
        pick = () => undefined;
      }
    }
    // Check string formats
    if (type === 'string' && !!typeProp.format) {
      const { test, default: _default } = StringFormats[typeProp.format];
      _refine = test;
      getDefault = () => _default;
    }
  }
  // Setup default val
  if (getDefault === undefined) {
    if (isObj(typeProp) && typeProp.default !== undefined) {
      getDefault = () => cloneFn(typeProp.default, isDate);
    } else if (type === 'object' && nullable) {
      getDefault = () => null;
    } else {
      getDefault = () => _getDefault(rootType, isArr);
    }
  }
  // Return
  return {
    propName: key,
    isArr,
    optional,
    type,
    rootType,
    origType,
    nullable,
    getDefault,
    pick, 
    isDate,
    refine,
    _refine,
    transform,
    range,
    _schema,
  };
}

/**
 * Get the default value non including relational keys.
 */
function _getDefault(rootType: string, isArr: boolean) {
  if (isArr) {
    return [];
  } else if (rootType === 'date') {
    return new Date();
  } else if (rootType === 'email') {
    return '';
  } else if (rootType === 'num') {
    return 0;
  } else if (rootType === 'bool') {
    return false;
  } if (rootType === 'pk' || rootType === 'fk') {
    return -1;
  } else if (rootType === 'color') {
    return '#FFFFFF';
  } else if (rootType === 'str') {
    return '';
  }
}

/**
 * Get the range function
 */
function _processRange(range: TRange): (arg: unknown) => boolean {
  const left = range[0], right = range[1];
  if (range === '+') {
    return (arg: unknown) => isNum(arg) && arg >= 0;
  } else if (range === '-') {
    return (arg: unknown) => isNum(arg) && arg < 0;
  } else if (isNum(left) && isNum(right)) {
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
