
import MI, { ModelInitializer, TObjSchema } from '../src';


enum Status {
  NA,
  Active,
  Suspended,
}

// User as it appears in the database
export interface IUser {
  id: number; // pk
  age: number;
  name: string;
  lname: string;
  email?: string;
  displayName?: string;
  lastLogin: Date;
  created: Date;
  active: boolean;
  boss: number | null;
  children: string[];
  foo?: string | null;
  avatar?: IAvatar;
  avatar2: IAvatar | null;
  avatar3?: IAvatar | null;
  avatar4: IAvatar;
  avatar5: IAvatar;
  parentId: number | null;
  color: string;
  color2: string;
  orderDir: string;
  adminType: number;
  page: number;
  status: Status;
  statuses?: Status[];
  boo: boolean;
  booOpt?: boolean | null;
  booArr: boolean[];
  address?: {
    street: string;
    city: string;
    state: string;
    zip: number;
  },
  rangeTest: number;
  rangeTest2: number;
  rangeTest3: number;
}

interface IAvatar {
  fileName: string;
  data: string;
  fileTypes?: 'jpeg' | 'jpg' | 'png' | 'gif';
}

const a: TObjSchema<IAvatar> = {
  fileName: 'str',
  data: 'str',
  fileTypes: {
    type: '?str',
    refine: ['jpeg', 'jpg', 'png', 'gif'],
  }
};

// Create check avatar function
const checkAvatar = MI.test<IUser['avatar']>({
  ...a,
});

// User schema
const User = MI.init<IUser>({
  id: 'pk',
  age: 'num+',
  name: 'strf',
  lname: 'strf',
  email: '?email',
  displayName: { type: '?str', default: '' },
  lastLogin: 'date',
  created: 'date',
  active: 'bool',
  boss: 'fk | null',
  foo: '?str | null',
  avatar: { type: '?obj', refine: checkAvatar },
  avatar2: { type: 'obj | null', refine: checkAvatar },
  avatar3: { type: '?obj | null', refine: checkAvatar },
  avatar4: {
    type: 'obj',
    default: { fileName: '', data: '' },
    refine: checkAvatar,
  },
  avatar5: {
    type: 'obj',
    default: { fileName: '', data: '' },
    refine: checkAvatar,
    transform: 'json',
  },
  children: 'str[]',
  parentId: { type: 'fk | null', default: null },
  color: 'color',
  color2: {
    type: 'str',
    refine: (arg: unknown) => typeof arg === 'string',
  },
  orderDir: { type: 'str', refine: ['asc', 'desc', ''] },
  adminType: { type: 'num', refine: [1, 2, 0] },
  page: { type: 'num', transform: 'auto' },
  status: 'num',
  statuses: '?num[]',
  boo: { type: 'bool', transform: arg => Boolean(arg) },
  booOpt: { type: '?bool | null', transform: 'auto' },
  booArr: { type: 'bool[]', transform: () => [] },
  address: {
    type: '?obj',
    default: { street: '', city: '', state: '', zip: 0 },
    refine: MI.test<IUser['address']>({
      street: 'str',
      city: 'str',
      state: 'str',
      zip: 'num',
    })
  },
  rangeTest: { type: 'num', range: [1, 100] },
  rangeTest2: { type: 'num', range: [100, 1] },
  rangeTest3: { type: 'num', range: ['>=', 35] },
});

// Check "new()" function
const user1 = User.new({
  id: 1234,
  name: 'jose',
  age: 4,
  avatar3: null,
  avatar5: JSON.stringify({ fileName: 'foo', data: 'bar' }) as any,
  page: '1234' as any,
  boo: null as any,
  rangeTest: 50,
  rangeTest2: 101,
  rangeTest3: 75,
});
console.log(user1)

// Extract the address validation
const obj: unknown = {
  street: '',
  city: '',
  state: '',
  // zip: 'hello',
  zip: 0,
}
if (User.pick('address').vldt(obj)) {
  console.log('address validation passed');
}
console.log(User.pick('address').default())

// Test validating an array of objects
const checkAvatars = MI.testArr<IUser['avatar']>({
  ...a,
});
const result = checkAvatars([
  { fileName: '', data: '' },
  { fileName: '', data: '' },
  { fileName: '', data: '' },
]);
console.log(result)


// Test errors

// const UserBad = MI.init<IUser>({
//   id: { type: 'pk', default: -1 },
//   age: '?number',
//   name: 'string | null',
//   email: 'email',
//   displayName: { type: 'string', default: 123 },
//   lastLogin: 'asdfadsf',
//   created: '?date',
//   active: 'boolean[]',
//   boss: 'fk',
//   foo: 'string | null',
//   avatar: null,
//   avatar2: { type: 'object | null' },
//   avatar3: { type: '?object | null', default: {}, refine: checkAvatar },
//   avatar4: { type: '?object', default: { fileName: '', data: '' }, refine: checkAvatar },
//   children: 'string',
//   parentId: 'fk',
//   color: 'string[]',
//   color2: {
//     type: 'string',
//     refine: ['horse'],
//   },
//   orderDir: { type: 'string', refine: ['asc', 'desc', 0] },
//   adminType: { type: 'number', refine: [1, 2, 'horse'] }
// });

// const MIx = new ModelInitializer(arg => arg)

// const Dog = MIx.init<{ name: string, bday: Date }>({
//   name: 'string',
//   bday: 'date',
// })

// Dog.new({ name: 'fido', bday: 'horse' as any })
// User.new({ id: 1234, orderDir: 'cheese' });


// const badValue = JSON.stringify([1,2,'horse']),
//   badTransformed = MI.test.val<number[]>(badValue, { type: 'number[]', transform: 'json' })
// console.log(badTransformed)
