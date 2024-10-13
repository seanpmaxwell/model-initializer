
export default {
  modelInvalid() {
    return 'The record argument was falsey or not an object';
  },
  propMissing(propName: string) {
    return `Property "${propName}" was not present but is required in ` +  
      'the supplied object';
  },
  refineFailed(propName: string) {
    return `Property "${propName}" failed to pass the refine constraint`;
  },
  notValidDate(propName: string) {
    return `Property "${propName}" is not a valid date object`;
  },
  default(propName: string) {
    return `Property "${propName}" does not satisfy the constraints`;
  },
  defaultNotFoundForObj(propName: string) {
    return `If "${propName}" is an object, required, and not nullable then ` + 
      'a default value must be provided.';
  },
  typeInvalid(propName: string) {
    return `"${propName}" must be string, number, boolean, date, object, ` + 
      'or an array of one of these.';
  },
  relationalKey(propName: string) {
    return `Relational key "${propName}" must be type number or "null" if ` + 
      'it\'s nullable.';
  },
  refineMissing(propName: string) {
    return `A refine function is required for object "${propName}".`;
  },
  notValidArr(propName: string) {
    return `An array type was specified but "${propName}" is not a valid ` + 
      'array.';
  },
  notNullable(propName: string) {
    return `Value found for "${propName}" was null, but "nullable" was not ` + 
      'marked as true.';
  },
  email(propName: string) {
    return `Property "${propName}" must be an empty string or valid email`;
  },
  color(propName: string) {
    return `Property "${propName}" must be valid color hex string i.e. "#FFFFFF"`;
  },
  rangeValidationFailed(propName: string) {
    return `Property "${propName}" failed range validation.`;
  },
} as const;
