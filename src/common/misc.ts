
/**
 * Process the "type" on a property object.
 */
export function processType(propType: string): {
  isArr: boolean,
  isOptional: boolean,
  type: string,
} {
    let isOptional = false,
    type: string = propType,
    isArr = false;
  if (type.startsWith('?')) {
    isOptional = true;
    type = type.substring(1);
  }
  if (type.endsWith('[]')) {
    isArr = true;
    type = type.slice(0, type.length - 2);
  }
  return { isArr, isOptional, type };
}