
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
}

interface IAvatar {
  fileName: string;
  data: string;
  fileTypes?: 'jpeg' | 'jpg' | 'png' | 'gif';
}

const a: TObjSchema<IAvatar> = {
  fileName: 'string',
  data: 'string',
  fileTypes: {
    type: '?string',
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
  age: 'number',
  name: 'string',
  email: '?email',
  displayName: { type: '?string', default: '' },
  lastLogin: 'date',
  created: 'date',
  active: 'boolean',
  boss: 'fk | null',
  foo: '?string | null',
  avatar: { type: '?object', refine: checkAvatar },
  avatar2: { type: 'object | null', refine: checkAvatar },
  avatar3: { type: '?object | null', refine: checkAvatar },
  avatar4: {
    type: 'object',
    default: { fileName: '', data: '' },
    refine: checkAvatar,
  },
  avatar5: {
    type: 'object',
    default: { fileName: '', data: '' },
    refine: checkAvatar,
    transform: 'json',
  },
  children: 'string[]',
  parentId: { type: 'fk | null', default: null },
  color: 'color',
  color2: {
    type: 'string',
    refine: (arg: unknown) => typeof arg === 'string',
  },
  orderDir: { type: 'string', refine: ['asc', 'desc', ''] },
  adminType: { type: 'number', refine: [1, 2, 0] },
  page: { type: 'number', transform: 'auto' },
  status: 'number',
  statuses: '?number[]',
  boo: { type: 'boolean', transform: arg => Boolean(arg) },
  booOpt: { type: '?boolean | null', transform: 'auto' },
  booArr: { type: 'boolean[]', transform: () => [] },
  address: {
    type: '?object',
    default: { street: '', city: '', state: '', zip: 0 },
    refine: MI.test<IUser['address']>({
      street: 'string',
      city: 'string',
      state: 'string',
      zip: 'number',
    })
  }
});

// Check "new()" function
const user1 = User.new({
  id: 1234,
  avatar3: null,
  avatar5: JSON.stringify({ fileName: 'foo', data: 'bar' }) as any,
  page: '1234' as any,
  boo: null as any,
});
console.log(user1)

// Test validating an array of objects
const checkAvatars = MI.test<IUser['avatar']>({
  ...a,
});
const result = checkAvatars([
  { fileName: '', data: '' },
  { fileName: '', data: '' },
  { fileName: '', data: '' },
]);
console.log(result)


// Extract the address validation
User.vldt('address')({
  street: '',
  city: '',
  state: '',
  // zip: 'hello',
  zip: 0,
});




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
