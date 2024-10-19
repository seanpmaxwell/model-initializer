
import MI, { TObjSchema, inferTypes } from '../src';


enum Status {
  NA,
  Active,
  Suspended,
  Foo
}

enum Fruit {
  Apple = 'Apple',
  Orange = 'Orange',
  Hat = 1,
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
  recordTestObject: object;
  recordTest3: Record<number, unknown>;
  recordTest4: Record<string, string>;
  recordTest5: Record<any, any>;
  recordTest6: Record<string, any>;
  recordTest7: {};
  recordTest8: IAvatar;
  imageTest1: IImage;
  imageTest2: IImage[];
  imageTest3?: IImage;
  imageTest4: IImage | null;
  imageTest5?: IImage | null;
  imageTest6?: IImage[] | null;
  emptyArrTest?: [];
  enumTest1: Status;
  enumTest2: Fruit;
  altTest: IAlt;
}

type IAvatar = {
  fileName: string;
  data: string;
  fileTypes?: 'jpeg' | 'jpg' | 'png' | 'gif';
}

interface IImage {
  fileName: string;
  base64Str?: string;
}

interface IAlt {
  0: string;
}

// type IImage = {
//   fileName: string;
//   base64Str?: string;
// }

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
    trans: 'json',
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
  page: { type: 'num', trans: 'auto' },
  status: 'num',
  statuses: '?num[]',
  boo: { type: 'bool', trans: arg => Boolean(arg) },
  booOpt: { type: '?bool | null', trans: 'auto' },
  booArr: { type: 'bool[]', trans: () => [] },
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
    refine: (() => true) as any,
    default: {},
  },
  recordTest: {
    type: '?obj[]',
    // props: {},
    refine: (() => true) as any,
    // default: '' as any,
  },
  recordTestObject: {
    type: 'obj',
    // props: { horse: 'str' },
    refine: (() => true) as any,
    default: {},
  },
  recordTest3: {
    type: 'obj',
    // props: { },
    refine: (() => true) as any,
    // default: '', doesn't throw type error but shows runtime error
    default: {},
  },
  recordTest4: {
    type: 'obj',
    // props: { },
    refine: (() => true) as any,
    default: {},
  },
  recordTest5: {
    type: 'obj',
    // props: { },
    refine: (() => true) as any,
    default: {},
  },
  recordTest6: {
    type: 'obj',
    // props: { },
    refine: (() => true) as any,
    default: {},
  },
  recordTest7: {
    type: 'obj',
    props: {},
    // refine: (() => true) as any,
    // default: '' as any,
  },
  recordTest8: {
    type: 'obj',
    props: { fileName: 'str', data: 'str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  imageTest1: {
    type: 'obj',
    props: { fileName: 'str', base64Str: '?str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  imageTest2: {
    type: 'obj[]',
    props: { fileName: 'str', base64Str: '?str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  imageTest3: {
    type: '?obj',
    props: { fileName: 'str', base64Str: '?str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  imageTest4: {
    type: 'obj | null',
    props: { fileName: 'str', base64Str: '?str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  imageTest5: {
    type: '?obj | null',
    props: { fileName: 'str', base64Str: '?str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  imageTest6: {
    type: '?obj[] | null',
    props: { fileName: 'str', base64Str: '?str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  emptyArrTest: {
    type: '?bool[]',
    // props: { fileName: 'str', base64Str: '?str' },
    // refine: (() => true) as any,
    // default: '' as any,
  },
  enumTest1: { type: 'enum', refine: Status },
  enumTest2: { type: 'enum', refine: Fruit },
  altTest: {
    type: 'obj',
    // props: { '0': 'str' }, // This works too
    props: { 0: 'str' },
  }
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
  // enumTest1: Status.Active,
  // enumTest2: Fruit.Apple,
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
// User.pick('age').pick('')
// User.pick('orderDir').pick()
User.pick('avatar4').pick('data')
User.pick('avatar4').pick('fileName').default().length.toFixed()
// User.pick('avatar5').pick('data')
User.pick('nested').pick('bar')
User.pick('record')
User.pick('recordTest4')
console.log(User.pick('nested').pick('horse').default())
console.log(User.pick('nested').pick('horse').pick('name').default());
// User.pick('nested').pick('horse').pick('name')
// User.pick('record')
User.pick('recordTest')
// User.pick('recordTestObject')
// User.pick('recordTest3')
User.pick('recordTest7').default()

console.log(User.pick('recordTest8').pick('data'))
if (User.pick('nested').pick('foo')) {
  const val = User.pick('nested').pick('foo').default();
  console.log(val)
}

User.pick('imageTest1').pick('fileName')
User.pick('imageTest2')
User.pick('imageTest3').pick?.('fileName')
User.pick('imageTest4').pick?.('fileName')
User.pick('imageTest5').pick?.('fileName')

console.log(MI.StringFormats.color.test('asdf'));



const Dog = MI.init({
  name: { type: 'str', default: 'asdf' },
  owner: {
    type: 'obj',
    // props: { address: 'str' },
    refine: (() => '') as any,
    default: ('asdf') as any,
  },
  other: {
    type: '?bool | null',
    // refine: (arg: unknown): arg is string => false,
  },
});
// type TDog = inferTypes<typeof Dog>;


// let dog: TDog = {
//   name: '',
//   // owner: {
//   //   address: 'asdf'
//   // },
//   owner: 'dave',
//   other: undefined
// }
