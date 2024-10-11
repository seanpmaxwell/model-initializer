# About model-initializer
<h3>Quick, easy, typescript-first library for initializing and validating objects. Works client or server side and much simpler than other schema validation tools like <b>zod</b>. Unlike typia, doesn't require an extra compilation step so still works with ts-node.</h3>
<br/>

## Summary
- This library's default export is a module that holds 2 properties `init` and `test`. `init` is the heart of the library, `test` contains helper functions, see the second to last section.
- When you pass `init` a generic and an object used to represent your schema, it gives you back an object with 2 functions: `new` and `isValid` in which typesafety is enforced by the generic you passed.
  - `new()` let's us create new object using a partial of your model and defaults from the array. Defaults are deep-cloned before being added. The returned value is a full (not partial) object of your schema (minus certain optional ones, see the guide).
  - `isValid()` accepts an unknown argument and throws errors if they do not match the required schema.
- Just to point out I know there are tons of schema validation libraries out there, but I wanted something that would both validate a schema, let me setup new instances using partials and defaults, and which would allow me to typesafe any properties I tried to add to the schema using an `interface`.
- By default the `Date()` constructor is used for date validation and `structuredClone()` is used for deep cloning values. I know some older versions of node don't supported `structuredClone()` and most people have fancier libraries for handling dates, so you can set your own date/clone functions if you want: see the last section.
<br/>


## Quick Start
- Installation: `npm i -s modal-initializer`.
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
  lastLogin: Date | null;
  created: Date;
  active: boolean;
  boss: number;
  children: string[];
  avatar?: { fileName: string; data: string };
}

// Check is valid avatar
const isAvatar = MI.test.obj<IUser['avatar']>({
  fileName: 'string',
  data: 'string',
});

// Setup "User schema"
const User = MI.init<IUser>({
  id: 'pk',
  name: 'string',
  email: '?email', // Use '?' for optional types
  displayName: { type: '?string', default: '' },
  age: 'number',
  lastLogin: 'date | null',
  created: 'date',
  active: 'boolean',
  avatar: { type: '?object', refine: isAvatar },
  children: 'string[]',
});

const user1 = User.new({ name: 'john' });
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
User.isValid('user'); // should throw Error
```
<br/>


## Guide

### Property Object

- Each key of the schema object must be a key in the type you pass. The value can be a string representing the type OR an object:
```typescript
{
  type: 'string' | 'number' ...etc;
  default?: YourModel[keyof YourModel];
  refine?: (arg: unknown) => arg is YourModel[keyof YourModel] OR you can pass a string or number array;
  transform?: (arg: unknown) => T
}
```
- `type`: The root types are `'string' | 'number' | 'boolean' | 'date' | object | email | color`
  - Each one has an array counterpart: i.e. `string[]` and can be prepending with `?` to make it optional i.e. `?string[]`.
  - Every property can be appended with ` | null` to make it nullable. 
  - There is also `pk` (primary-key) and `fk` (foreign-key).
- `default`: optional (except for `object`'s which are not optional, nullable, or an array), a value passed to `new()` if the key is absent from the partial being passed.
- `refine`: optional for all types but required in those which include `object` (i.e. `?object[]`).
  - This function will always be called if truthy and will be used in `new` and `isValid` to validate a value.
  - For each `string` or `number` type, you can also pass string or number array to `refine` instead of a function. The validation check will make sure that the value is included in the array.
- `transform`: you might want to transform a value before validating it or setting in the new function. You can pass the optional `transform` property. Transform will run before validation is done and manipulate the original object being passed with a new value. If the key is absent from the object, then `transform` will be skipped. To give an example, maybe you received a string value over an API call and you want it transformed into a `number` or you want to run `JSON.parse`.
  - `transform` can be a a function `(arg: unknown) => "typesafe value"`, `auto` or `json`.
  - `auto` can work for `number`, `string` or `boolean` base-types is short for doing `(arg: unknown) => "Base-Type ie Number"(arg)`
  - `json` can be applied to any type and is short for doing `(arg: unknown) => JSON.parse(arg)`
  - Note that transform will NOT be applied to the default values.
```typescript
  avatar: { type: 'object', refine: _someFun, transform: 'json' },
```

### Nullable 
- `| null` means that null is a valid value regardless of what's set by type.
- If a property is nullable and optional, then a property whose value is null will be skipped in the `new()` function
- When `new` is called, if a `object` is not optional, but is nullable, and no default is supplied, then null will be used

### Defaults (only relevant to the "new" function)
- When using `new`, if you supply a default then that will be always be used regardless if the value is optional or not. 
- If there is no value passed to `new()` and the property is optional, then that key/value pair will be skipped in the object returned from `new()`.
- If a property is not optional and you do not supply a value in the partial to `new`, then the following defaults will be used:
  - `string`: empty string `''`
  - `number`: `0`
  - `boolean`: `false`
  - `date`: the current datetime as a `Date` object.
  - `for values ending with "[]"`: an empty array.
  - `object`: If an object type is not optional, nullable, or an array, then you must supply a valid default to prevent a bad object from getting attached. Objects arrays will just use an empty array as the default. If an object is nullable then `null` will be used as the default.
  - `email`: empty string
  - `color`: `#FFFFFF` that's the hex code for white
  - `pk` and `fk`: `-1`

### Arrays/Emails/Colors
- Validation only works for one-dimensional arrays. If you have nested arrays set the type to `object` and write your own `refine` function.
- There is a built-in regex to check the email and color formats. If you want to use your own, set the type to string and pass your own `refine` function. Note that an empty string counts as a valid email and will be used as the default value if the email is not optional.

### PK (primary-key) and FK (foreign-key)
- These are used to represent relational database keys:
  - `pk` cannot have any properties set on it.
  - For `fk` the only properties you can set are `type`, and `default`. You can set `default` ONLY if `nullable` in which cause you can set the default to be `-1` or `null` only.
  - There reason defaults are `-1` is cause primary keys should be set to a positive number by the database, so `-1` is used to represent a record that has not been saved in the database yet. I use postgres where convention is to use the `SERIAL` type for database keys.

### Validation
- Validation of values and not just types will be done both in the `isValid` function and in the `new` function before setting a value passed from a partial. Default values (if you passed your own custom default) will also be validated. The reason I decided to make it throw errors instead of just return a boolean is so we can read the name of the property that failed and see exactly where the validation failed. If you don't want it throw errors you should wrap `isValid` and `new` in `try/catch` blocks and handle the error message and values manually.

#### The `MI.test` object
- Creating validator functions for object properties can get a little tedious, that's why is decided to include the `obj()` function on the `test` object. `obj()` works very similar to `isValid` and just like `init` you pass it a generic along with an array of properties but the `default:` prop is not required since we're only dealing with type-validation and not setting any values. The quick start above contains an example of `obj()` in action. I've found that the `obj()` very useful even outside of my database models. I use it for validation on the back-end in my routing layer for checking incoming API objects not attached to db-models.
- `objarr` works just like `obj` except it expects an array of objects and applies the validator function to each item in the array.
- You can test individual values with the `val` function. Simply pass a single type-object or string `MI.test.val<number>({type: number})`. Unlike `obj` and `objarr` though, this returns a validator-function that returns the value itself (and the transformed value if you passed the `transform` prop) and not a boolean.
- Please look at the `test/index.ts` file to see examples of `MI.test`.


### Setting your own clone function
- If you want to forgo using `structuredClone()`, then you will need to pass your own `clone`, functions to init:
```typescript
import { ModelInitializer } from 'model-intializer';

const modelInitializer = new ModelInitializer('pass your own cloneFn to the constructor');
export default modelInitializer;
```
