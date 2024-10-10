import MI, { Vldt, TTestObjFnSchema } from '../src';


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
  parentId: number | null;
  color: string;
  color2: string;
  orderDir: string;
  adminType: number;
}

interface IAvatar {
  fileName: string;
  data: string;
  fileTypes?: 'jpeg' | 'jpg' | 'png' | 'gif';
}

const a: TTestObjFnSchema<IAvatar> = {
  fileName: 'string',
  data: 'string',
  fileTypes: {
    type: '?string',
    refine: ['jpeg', 'jpg', 'png', 'gif'],
  }
};

// Create check avatar function
const checkAvatar = Vldt.obj<IUser['avatar']>({
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
  children: 'string[]',
  parentId: { type: 'fk | null', default: null },
  color: 'color',
  color2: {
    type: 'string',
    refine: (arg: unknown): arg is IUser['color2'] => Vldt.color(arg),
  },
  orderDir: { type: 'string', refine: ['asc', 'desc', ''] },
  adminType: { type: 'number', refine: [1, 2, 0] }
});

// Print results
const user1 = User.new({ id: 1234, avatar3: null });
console.log(user1)


// Test errors

// MI.setTimeCloneFns({
//   cloneDeep: arg => arg,
//   validateTime: arg => false, // should force error
//   toDate: arg => new Date(),
// });

// const Dog = MI.init<{ name: string, bday: Date}>({
//   name: 'string',
//   bday: 'date',
// })

// Dog.new({ name: 'fido', bday: new Date() })


const user2 = User.new({ id: 1234, orderDir: 'asc' });
