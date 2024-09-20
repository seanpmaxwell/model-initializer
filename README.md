# About model-initializer
<h3>Quick, simple, and fully-typesafe library for setting up models used to represent database schemas.</h3>

## Summary
- This library's default export is a module that holds 2 functions `init` and `checkObj`. `init` is the heart of the library, we'll talk about `checkObj` later.
- When you pass `init` a generic and an array of objects used to represent your schema, it gives you back an object with 2 functions: `new` and `isValid` which typesafety enforced by the generic you passed.
  - `new()` let's us create new object using a partial of your model and defaults from the array. Defaults are deep cloned before being added. The returned value is a full (not partial) object of your schema (minus certain optional ones, see the guide).
  - `isValid()` accepts an unknown argument and throws errors if they do not match the required schema.
- Just to point out I know there are tons of schema validation libraries out there, but I wanted something that would both validate a schema, let me setup new instances using partials and defaults, and which would allow me to typesafe any properties I tried to add to the schema using an `interface`.
- By default `moment` is used for date validation and `lodash` is used for deep cloning values. I know these are big libraries that not everyone likes so if you don't want to use them you must pass your own time validation and deep clone functions: see last section.


## Quick Start
- Installation: `npm i -s modal-initializer lodash moment` or just `npm i -s modal-initializer` if you decided to add your own time-validation/cloning function.
- Create a type to represent your model and an array of objects. `init` requires 1 generic so pass it the type and the array.

```typescript
import ModelInitializer from 'model-initializer';

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

// Setup "User schema"
const User = ModelInitializer.init<IUser>([
  { prop: 'id', type: 'pk' },
  { prop: 'name', type: 'string' },
  { prop: 'email', type: 'string', optional: true },
  { prop: 'displayName', type: 'string', optional: true, default: '' },
  { prop: 'age', type: 'number' },
  { prop: 'lastLogin', type: 'date' },
  { prop: 'created', type: 'date' },
  { prop: 'active', type: 'boolean' },
  { prop: 'boss', type: 'fk', nullable: true, default: null },
  { prop: 'avatar', type: 'object', optional: true, vldrFn: _checkAvatar },
  { prop: 'children', type: 'string[]', optional: false },
]);

// Validate Avatar object
function _checkAvatar(arg: unknown): arg is IUser['avatar'] {
  return ModelInitializer.checkObj<IUser['avatar']>([
    { prop: 'fileName', type: 'string' },
    { prop: 'data', type: 'string' }
  ])(arg);
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


## Guide

### Property Object

- The full structure for an array prop object looks like. Note that `prop` and `default` are fully typesafe:
```typescript
type Prop<YourModel, keyof YourModel> = {
  prop: keyof YourModel;
  type: 'string' | 'number' ...etc;
  nullable?: boolean;
  optional?: boolean;
  default?: YourModel[keyof YourModel];
  vldrFn?: (arg: unknown) => arg is YourModel[keyof YourModel];
}
```
- `prop`: Must be a key of the type you pass to the `init` generic.
- `type`: There are 12 types to chose from. The 5 basic types are `'string' | 'number' | 'boolean' | 'date' | object`, each one has an array counter part: i.e. `string[]`. There is also `pk` (primary-key) and `fk` (foreign-key).
- `nullable`: optional, default is `false`, says that null is a valid value regardless of what's set by type.
- `optional`: optional, default is `false`, prevents an error from being thrown if key is absent from the `isValid` check and tells `new` to skip this key if it's not in the partial and there is no default.
- `default`: optional, except for `object`s when `optional` is `false`, a default value passed to `new` if the key is absent from the partial being passed.
- `vldrFn`: optional for all types except `object` and `object[]`. This function will always be called if truthy and will be used in `new` and `isValid` to validate a value.

### Special notes about pk and fk
- These are used to represent relational database keys:
  - For `pk` the only properties you can set are `prop` and `type`, primary-keys should never be `null` in a database.
  - For `fk` the only properties you can set are `prop`, `type`, and `nullable`. You can set `default` ONLY if `nullable` is true in which cause you can set the default to be `-1` or `null` only.
  - There reason defaults are `-1` is cause primary keys should be set to a positive number by the database, so `-1` is used to represent a record that has not been saved in the database yet. I use postgres where convention is to use the `SERIAL` type for database keys.

### Defaults (only relevant to the "new" function)
- When using `new`, if you supply a default then that will be always be used regardless if the value is optional or not. If a property is required and you do not supply a value in the partial to `new`, then the following defaults will be used. If there is no value passed to `new` and the property ID optional, then that key/value pair will be skipped in the object returned from `new`.
- `string`: empty string `''`
- `number`: `0`
- `boolean`: `false`
- `date`: the current datetime as a `Date` object.
- `for values ending with "[]"`: an empty array.
- `object`: If an object type is not optional, then you must supply a valid default to prevent a bad object from getting attached. For `object[]` that are not optional, you don't have to supply a default cause `new` will just append an empty array.
- `pk` and `fk`: `-1`

### Validation
- Validation of values and not just types will be done both in the `isValid` function and in the `new` function before setting a value passed from a partial. Default values (if you passed your own custom default) will also be validated. The reason I decided to make it throw errors instead of just return a boolean is so we can read the name of the property that failed and see exactly where the validation failed. If you don't want it throw errors you should wrap `isValid` and `new` in `try/catch` blocks and handle the error message and values manually.
- The array types `string[]`, `boolean[]` etc will only work for single layer arrays. If you want to validate a nested array just mark it as an `object[]` and pass your validator function.

### checkObj Function
- Creating validator functions for object properties can get a little tedious, that's why is decided to include the `checkObj` function in addition to `init`. `checkObj` works very similar to `isValid` and just like `init` you pass it a generic along with an array of properties but the `default:` prop is absent since we're only dealing with type-validation and not setting any values. The quick start above contains an example of `checkObj` in action.

### Setting your own time/clone functions
- I've never created a project that didn't use `moment` and `lodash` so that's what I decided to use, but I've heard some developers fuss that these libraries are overkill or provide way more than what they usually need. So if you want to forgo them you will need to pass your own `cloneDeep`, `validateTime`, `toDate` functions to init:
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
