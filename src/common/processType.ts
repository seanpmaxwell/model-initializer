import { TAllTypes } from './types';


interface ISchemaType {
  type: TAllTypes;
  nullable?: boolean;
  vldrFn?: (arg: unknown) => boolean;
}

export interface ITypeObj {
  type: string;
  optional: boolean;
  nullable: boolean;
  isArr: boolean;
  isEmail: boolean;
  hasDefault: boolean;
  isDate: boolean;
  vldrFn?: (arg: unknown) => boolean;
}

/**
 * Process the value on a schema object. 
 */
function processType(schemaType: string | ISchemaType): ITypeObj  {
  // Init
  let type = '',
    nullable = false,
    isArr = false,
    optional = false,
    vldrFn,
    isDate = false,
    hasDefault = false,
    isEmail = false;
  // Check
  if (!schemaType) {
    throw new Error('schema property should not be falsey')
  }
  // Type could be string or object
  if (typeof schemaType === 'string') {
    type = schemaType;
  } else if (typeof schemaType === 'object') {
    type = schemaType.type;
    nullable = !!schemaType.nullable;
    if (schemaType.type !== 'fk') {
      vldrFn = schemaType.vldrFn;
    }
    if ('default' in schemaType) {
      hasDefault = true;
    }
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
  // Primary-key or Foreign-key
  if (type === 'email') {
    isEmail = true;
  } else if (type === 'date') {
    isDate = true;
  }
  // Return
  return {
    isArr,
    optional,
    type,
    nullable,
    isEmail,
    hasDefault,
    isDate,
    vldrFn,
  };
}


// **** Export default **** //

export default processType;
