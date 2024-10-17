
import MI, { ModelInitializer, TObjSchema } from '../src';
import { TModelSchema } from '../src/types';


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
  avatar5: IAvatar[];
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
  rangeTest4: number;
  nested: {
    foo: string;
    bar: number;
    blah: boolean;
    horse: {
      name: string;
      owner: {
        name: string;
      }
    };
    // horsee: object;
  };
  record: Record<string, unknown>;
  recordTest?: Record<string, unknown>[];
  recordTest2: object;
  anyTest: string;
  anyTest2: object;
  anyTest3: IAvatar;
  anyTest4: Record<string, unknown>;
}

type IAvatar = {
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

// User schema
const User = MI.init<IUser>({
  id: 'pk',
  age: { type: 'num', range: '+' },
  name: 'str',
  lname: { type: 'str', format: 'nonemp' },
  email: { type: '?str', format: 'email' },
  displayName: { type: '?str', default: '' },
  lastLogin: 'date',
  created: 'date',
  active: 'bool',
  boss: 'fk | null',
  foo: '?str | null',
  avatar: { type: '?obj', props: a },
  avatar2: { type: 'obj | null', props: a },
  avatar3: { type: '?obj | null', props: a },
  avatar4: {
    type: 'obj',
    props: { fileName: 'str', data: 'str' },
  },
  avatar5: {
    type: 'obj[]',
    props: { fileName: 'str', data: 'str' },
    transform: 'json',
  },
  children: 'str[]',
  parentId: { type: 'fk | null', default: null },
  color: { type: 'str', format: 'color' },
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
    props: {
      street: 'str',
      city: 'str',
      state: 'str',
      zip: 'num',
    },
  },
  rangeTest: { type: 'num', range: [1, 100] },
  rangeTest2: { type: 'num', range: [100, 1] },
  rangeTest3: { type: 'num', range: ['>=', 35] },
  rangeTest4: { type: 'num', range: '-' },
  nested: {
    type: 'obj',
    props: {
      foo: 'str',
      bar: 'num',
      blah: {
        type: 'bool',
        default: true,
      },
      horse: {
        type: 'obj',
        props: {
          name: { type: 'str', default: 'ed' },
          owner: {
            type: 'obj',
            props: { name: 'str' },
          }
        },
      },
      // horsee: null,
    },
  },
  record: { 
    type: 'obj',
    props: { },
  },
  recordTest: {
    type: '?obj[]',
    props: {},
    // props: {
    //   // dude: 'asdf'
    // },
    // refine: (() => {}) as any,
    // default: {},
    // default: [],
  },
  recordTest2: {
    type: 'obj',
    props: { },
  },
  anyTest: {
    type: 'any',
    refine: (() => true) as any,
    default: '',
  },
  anyTest2: {
    type: 'any',
    refine: (() => true) as any,
    default: {},
  },
  anyTest3: {
    type: 'any',
    refine: (() => true) as any,
    default: { fileName: 'str', data: 'str' },
  },
  anyTest4: {
    type: 'any',
    refine: (() => true) as any,
    default: { },
  },
});


// ** Check "new()" function ** //
const user1 = User.new({
  id: 1234,
  name: 'jose',
  age: 4,
  avatar3: null,
  avatar5: JSON.stringify([{ fileName: 'foo', data: 'bar' }]) as any,
  page: '1234' as any,
  boo: null as any,
  rangeTest: 50,
  rangeTest2: 101,
  rangeTest3: 75,
  rangeTest4: -55,
  email: 'asdf.asdf@asdf.com',
  color: '#ffffff',
  created: '2024-10-16T23:01:37.919Z' as any,
});
console.log(user1)


// ** Extract the address validation ** //
const obj: unknown = {
  street: '',
  city: '',
  state: '',
  // zip: 'hello',
  zip: 0,
}
if (User.pick('address').vldt(obj)) {
  console.log(obj);
}
console.log(User.pick('address').default())


// ** Test validating an array of objects ** //
const checkAvatars = MI.testArr<IUser['avatar']>({
  ...a,
});
const result = checkAvatars([
  { fileName: '', data: '' },
  { fileName: '', data: '' },
  { fileName: '', data: '' },
]);
console.log(result)


// ** Test nested ** //
User.pick('active')
User.pick('age')
// User.pick('orderDir').pick()
User.pick('avatar4').pick('data')
User.pick('avatar4').pick('fileName').default().length.toFixed()
// User.pick('avatar5').pick('data')
User.pick('nested').pick('bar')
console.log(User.pick('nested').pick('horse').pick('name').default());
// User.pick('nested').pick('horse').pick('name')
User.pick('record')
User.pick('recordTest')
User.pick('anyTest2').default;
console.log(User.pick('anyTest3').pick('data')) // <-- Possibly unsafe
if (User.pick('nested').pick('foo')) {
  const val = User.pick('nested').pick('foo').default();
  console.log(val)
}

