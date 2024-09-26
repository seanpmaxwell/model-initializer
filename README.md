# About model-initializer
<h3>Quick, simple library for setting up models used to represent database schemas. Fully typesafe, works client or server side.</h3>
<br/>

## Summary
- This library's default export is a module that holds 2 functions `init` and `checkObj`. `init` is the heart of the library, `checkObj` is a helper function see the second to last section.
- When you pass `init` a generic and an object used to represent your schema, it gives you back an object with 2 functions: `new` and `isValid` in which typesafety is enforced by the generic you passed.
  - `new()` let's us create new object using a partial of your model and defaults from the array. Defaults are deep cloned before being added. The returned value is a full (not partial) object of your schema (minus certain optional ones, see the guide).
  - `isValid()` accepts an unknown argument and throws errors if they do not match the required schema.
- Just to point out I know there are tons of schema validation libraries out there, but I wanted something that would both validate a schema, let me setup new instances using partials and defaults, and which would allow me to typesafe any properties I tried to add to the schema using an `interface`.
- By default the `Date()` constructor is used for date validation and `structuredClone()` is used for deep cloning values. I know some older versions of node don't supported `structuredClone()` and most people have fancier libraries for handling dates, so you can set your own date/clone functions if you want: see the last section.
<br/>


## Quick Start
- Installation: ``npm i -s modal-initializer`.
- Create a type to represent your model and an array of objects. `init` requires 1 generic so pass it the type and the array.

```typescript
import MI from 'model-initializer';

// User as it appears in the database
export interface IUser {
  id: number; // pk
  age: number;
  name: string;
  email?: string;
  displayName?: string;
  lastLogin: Date;
  created: Date;
  active: boolean;
  boss: number;
  children: string[];
  avatar?: { fileName: string; data: string };
}

// Create check avatar function

// Setup "User schema"
const User = MI.init<IUser>([
  id: 'pk',
  name: 'string',
  email: '?email', // Use '?' for optional types
  displayName: { type: '?string', default: '' },
  age: 'number',
  lastLogin: 'date',
  created: 'date',
  active: 'boolean',
  avatar: { type: '?object', vldrFn: checkAvatar },
  children: 'string[]',
]);

// Get the check avatar fn
function _getCheckAvatar() {
  return MI.checkObj<IUser['avatar']>([
    fileName: 'string',
    data: 'string',
  ]);
}



// Print results
const user1 = User.new({ name: 'john' });
console.log(user1)

// Above command outputs
// {
//   id: -1,
//   name: 'john',
//   displayName: '',
//   age: 0,
//   lastLogin: 2024-09-19T17:56:07.113Z,
//   created: 2024-09-19T17:56:07.113Z,
//   active: false,
//   boss: null,
//   children: []
// }

console.log(User.isValid('blah')) // throws "Error"
```
<br/>


## Guide

### Property Object

- Each key of the schema object must be a key in the type you pass. The value can be a string representing the type OR an object:
```typescript
{
  type: 'string' | 'number' ...etc;
  nullable?: boolean; // Default is false
  default?: YourModel[keyof YourModel];
  vldrFn?: (arg: unknown) => arg is YourModel[keyof YourModel];
}
```
- `type`: The 5 basic types are `'string' | 'number' | 'boolean' | 'date' | object | email`, each one has an array counter part: i.e. `string[]` and can be prepending with `?` to make it optional i.e. `?string[]`. There is also `pk` (primary-key) and `fk` (foreign-key).
- `nullable`: optional, default is `false`, says that null is a valid value regardless of what's set by type.
- `default`: optional, except for `object`s when `optional` is `false`, a default value passed to `new` if the key is absent from the partial being passed.
- `vldrFn`: optional for all types but required in those which include `object` (i.e. `?object[]`). This function will always be called if truthy and will be used in `new` and `isValid` to validate a value.

### Defaults (only relevant to the "new" function)
- When using `new`, if you supply a default then that will be always be used regardless if the value is optional or not. If a property is required and you do not supply a value in the partial to `new`, then the following defaults will be used. If there is no value passed to `new` and the property ID optional, then that key/value pair will be skipped in the object returned from `new`.
- `string`: empty string `''`
- `number`: `0`
- `boolean`: `false`
- `date`: the current datetime as a `Date` object.
- `for values ending with "[]"`: an empty array.
- `object`: If an object type is not optional or an array, then you must supply a valid default to prevent a bad object from getting attached. Objects arrays which just use an empty array as the default.
- `pk` and `fk`: `-1`

### Arrays/Emails/Optional-Types
- Validation only works for one-dimensional arrays. If you have nested arrays set the type to `object` and write your own validator function.
- There is a built-in regex to check the email format. If you want to use your own, set the type to string and pass your own validation function. Note that an empty array counts as a valid email and will be used as the default value if the email is not optional.
- The optional character prevents an error from being thrown if key is absent from the `isValid` check and tells `new` to skip this key if it's not in the partial and there is no default.

### PK (primary-key) and FK (foreign-key)
- These are used to represent relational database keys:
  - For `pk` the only properties you can set are `prop` and `type`, primary-keys should never be `null` in a database.
  - For `fk` the only properties you can set are `prop`, `type`, and `nullable`. You can set `default` ONLY if `nullable` is true in which cause you can set the default to be `-1` or `null` only.
  - There reason defaults are `-1` is cause primary keys should be set to a positive number by the database, so `-1` is used to represent a record that has not been saved in the database yet. I use postgres where convention is to use the `SERIAL` type for database keys.

### Validation
- Validation of values and not just types will be done both in the `isValid` function and in the `new` function before setting a value passed from a partial. Default values (if you passed your own custom default) will also be validated. The reason I decided to make it throw errors instead of just return a boolean is so we can read the name of the property that failed and see exactly where the validation failed. If you don't want it throw errors you should wrap `isValid` and `new` in `try/catch` blocks and handle the error message and values manually.

### checkObj Function
- Creating validator functions for object properties can get a little tedious, that's why is decided to include the `checkObj` function in addition to `init`. `checkObj` works very similar to `isValid` and just like `init` you pass it a generic along with an array of properties but the `default:` prop is not required since we're only dealing with type-validation and not setting any values. The quick start above contains an example of `checkObj` in action. I've found that the `checkObj` very useful even outside of my database models. I use it for validation on the back-end in my routing layer as well for checking incoming API data.

### Setting your own time/clone functions
- If you want to forgo using `new Date()` and `structuredClone()`, then you will need to pass your own `cloneDeep`, `validateTime`, `toDate` functions to init:
```typescript
// some pre-run script
import ModelInitializer, { ITimeCloneFns } from 'model-intializer';


const CUSTOM_ADDONS: ITimeCloneFns {
  cloneDeep: arg => { ...your clone deep logic; return clone };
  validateTime: arg => { ...your time validation logic; return boolean };
  toDate: arg => { ...convert value to a date };
}

ModelInitializer.timeDateFns = CUSTOM_ADDONS;

```
