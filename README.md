# About model-initializer
<h3>Quick, easy-to-learn, schema-validation (and initialization) library.</h3>


## Why Model-Initializer
- TypeScript first!
- Works client or server side.
- Works will both runtime and compile-time validation including `ts-node` (unlike `typia`).
- Super small, fast, and lightweight compared to some other schema-validation libraries.
- No it does not generate types for you BUT, I like modeling my data with interfaces cause they help to act as kind of a documentation for my model properties without having to dig through some long nested schema definitions. If you want something that does both, a library like `zod` or `typebox` might be better.
- Size comparison to other popular schema validators
  - TypeBox: `1.28 MB`
  - Ajv: `676 kB`
  - Zod: `570 kB`
  - Joi: `149 kB`
  - Model-Initializer: `44.9 kB` 😊

## Summary
- This library's default export is an object that holds several properties. The main one `init` is the heart of the library, we'll talk about the other ones later.
- To call `init` you must pass a generic and an object used to represent your schema (i.e. `init<IUser>({ name: 'string' })`) it gives you back an object with 3 functions: `new`, `isValid`, and `pick`. For all 3, typesafety is enforced by the generic you passed.
  - `new` let's us create new object using a partial of your model and returns a full complete object. For missing keys, values are supplied by defaults which you can optionally configure. Defaults are deep-cloned before being added.
  - `isValid` accepts an unknown argument and throws errors if they do not match the schema requirements.
  - `pick("prop")` extracts the validation logic and default value for a single property and returns an object with the format: `{ default: fn, vldt: fn }`. The property passed must be a key of the the generic passed to `init`. However, one difference with the `vldt` function is that `undefined` will not be accepted as a valid value even if the property is optional. `default()` returns a deep-clone of the default value. If the property is also a nested object, you can chain the `pick` method to select its values as well.
- By default `structuredClone()` is used for deep cloning values. I know some older versions of node don't supported `structuredClone()`, so you can set your own clone function if you want: see the last section.

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
  address: {
    street: string;
    city: string;
    country: {
      name: string;
      code: number;
    }
  };
}

// Setup "User schema"
const User = MI.init<IUser>({
  id: 'pk',
  name: 'str',
  email: '?email', // Use '?' for optional types
  displayName: { type: '?str', default: '' },
  age: 'num',
  lastLogin: 'date | null',
  created: 'date',
  active: 'bool',
  avatar: {
    type: '?obj',
    refine: MI.test<IUser['avatar']>({
      fileName: 'str',
      data: 'str',
    }),
  },
  children: 'str[]',
  address: {
    type: 'obj',
    props: {
      street: 'str',
      city: 'str',
      country: {
        type: 'obj',
        props: { name: 'str', code: 'num' },
      }
    },
  },
});

// We have an independent test functin
const checkAvatar = MI.test<IUser['avatar']>({
  fileName: 'str',
  data: 'str',
}),

User.isValid('user'); // should throw Error
const user1 = User.new({ name: 'john' });
console.log(user1)
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
const validateAvatar = User.pick('avatar').vldt;
```


## Guide

### Specifying the type

- Each key of the schema object must be a key in the type you pass. The value can be a string representing the type OR an object:
```typescript
{
  type: 'string' | 'number' ...etc;
  default?: the value of the property;
  refine?: Function, Array (strings and numbers), or Object (enums only);
  trans?: (arg: unknown) => T
  range?: [string | number, number] | '+' | '-'; // Numbers only
  props?: a nested object
}
```
- `type`: The root types are `'str' | 'num' | 'bool' | 'date' | obj | enum`
  - Each one has an array counterpart (except `enum`): i.e. `str[]` and can be prepending with `?` to make it optional i.e. `?str[]`.
  - Every property can be appended with ` | null` to make it nullable (except `enum`).
  - There is also `pk` (primary-key) and `fk` (foreign-key).
- `default`: optional, a value passed to `new()` if the key is absent from the partial being passed. There are some exceptions to it being optional with objects, see the <b>Objects</b> section below.
- `refine`: optional for all types except `enum`.
  - This function will always be called if truthy and will be used in `new` and `isValid` to validate a value.
  - For each `str` or `num` type, you can also pass string or number array to `refine` instead of a function. The validation check will make sure that the value is included in the array.
- `trans` (short for transform): you might want to transform a value before validating it or setting in the new function. You can pass the optional `trans` property. Transform will run before validation is done and manipulate the original object being passed with a new value. If the key is absent from the object, then `trans` will be skipped. To give an example, maybe you received a string value over an API call and you want it transformed into a `number` or you want to run `JSON.parse`.
  - `trans` can be a a function `(arg: unknown) => "typesafe value"`, `auto` or `json`.
  - `auto` can work for `num`, `str`, `bool`, `date` types and is short for doing `(arg: unknown) => "Base-Type i.e. Number"(arg)` 
  - `json` can be applied to any type and is short for doing `(arg: unknown) => JSON.parse(arg)`
  - Note that `trans` will NOT be applied to the default values.
- Number types can also have the `range` prop. The values are:
  - `+`: any positive number
  - `-`: any negative number
  - `[number, number]`: if the first value is less than the second value, range will check value is `>=` than the first value AND `<=` the second value. If the first value is greater than the second value, range will check value is `>=` than the first value OR `<=` the second value. 
  - `['<' | '>' | '<=' | '>=', number]`: Will perform a comparison against the provided number `['<=', 100]`

### Nullable 
- `| null` means that null is a valid value regardless of what's set by type.
- If a property is nullable and optional, then a property whose value is null will be skipped in the `new()` function.
- When `new` is called, if a `obj` is not optional, but is nullable, and no default is supplied, then null will be used.

### Defaults (only relevant to the "new" function)
- When using `new`, if you supply a default then that will be always be used regardless if the value is optional or not. 
- If there is no value passed to `new()` and the property is optional, then that key/value pair will be skipped in the object returned from `new()`.
- If a property is not optional and you do not supply a value in the partial to `new`, then the following defaults will be used:
  - `str`: empty string `''`.
  - `num`: `0`
  - `bool`: `false`
  - `date`: the current datetime as a `Date` object.
  - `for values ending with "[]"`: an empty array.
  - `obj`: See the objects section below.
  - `pk` and `fk`: `-1`

### Objects (`{ type: 'obj' }`)
- Some terminology: <b>static-object</b> is for objects with a distinct set of properties (i.e. a mapped-type alias, interface, or object returned from an object-literal) while <b>dynamic-object</b> refers to objects without specified keys like `Record<string, unknown>`, `object` etc.
- The libraries typesafety enforces that static-objects must specify their properties in the `props` key while dynamic-objects must define a `refine` function.
- static-objects' default value is defined in their schema, but for dynamic-objects you need to define your own default value. If a dynamic-object is not optional, then a default value is required.

### Enums
- For enum types you can set the type to `enum` and pass an enum-object to the `refine` prop. This will make sure that the value is a value in the enum and it will also set the first value in the `enum` as the default value when `new` is called.

### Arrays, Dates, and String formats
- Validation only works for one-dimensional arrays. If you have nested arrays set the type to `object` and write your own `refine` function.
- Any format for a date, such as string or number, will pass the date validation test if its a valid date. If you want it converted to a `Date` (or some other) object use the `trans` function.
- If you want to set a format for strings use can use the optional `format` property. Each format also includes a default value as well. The current formats and their defaults are:
  - `email`: `''` (Note that an empty string counts as a valid email)
  - `color` (a hexcode) `'#ffffff'`
  - `nonemp` (any non-empty string) `_`
- All functions for string validation (and the default values) can be accessed via the `StringFormats` prop i.e. `MI.StringFormats.email("some string")`.

### PK (primary-key) and FK (foreign-key)
- These are used to represent relational database keys. The defaults are `-1`.
  - `pk` cannot have any properties set on it.
  - For `fk` the only properties you can set are `type`, and `default`. You can set `default` ONLY if `nullable` in which cause you can set the default to be `-1` or `null` only.
  - There reason defaults are `-1` is cause primary keys should be set to a positive number by the database, so `-1` is used to represent a record that has not been saved in the database yet. I use postgres where convention is to use the `SERIAL` type for database keys.

### Some special notes on validation
- Validation of values and not just types will be done both in the `isValid` function and in the `new` function before setting a value passed from a partial. Default values (if you passed your own custom default) will also be validated. The reason I decided to make it throw errors instead of just return a boolean is so we can read the name of the property that failed and see exactly where the validation failed. If you don't want it throw errors you should wrap `isValid` and `new` in `try/catch` blocks and handle the error message and values manually.

#### The `MI.test()` function
- Creating validator functions for object properties can get a little tedious, that's why is decided to include the `test()` function. `test()` works very similar to `isValid` and just like `init` you pass it a generic along with an array of properties but the `default:` prop is not required since we're only dealing with type-validation and not setting any values. The quick start above contains an example of `test()` in action. I've found that the `obj()` very useful even outside of my database models. I use it for validation on the back-end in my routing layer for checking incoming API objects not attached to db-models.
- To make your life easier there is also the `MI.testArr()` function which is the same as test but returns and array of variant of the object used runs the validation against each item.

### Setting your own clone function
- If you want to forgo using `structuredClone()`, then you will need to pass your own `clone`, functions to init:
```typescript
import { ModelInitializer } from 'model-intializer';

const modelInitializer = new ModelInitializer('pass your own cloneFn to the constructor');
export default modelInitializer;
```
