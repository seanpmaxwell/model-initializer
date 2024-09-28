import MI from '../src';


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
  foo: string | null;
  avatar?: { fileName: string; data: string };
  avatar2: { fileName: string; data: string };
  parentId: number | null;
  color: string;
  color2: string;
}

// Create check avatar function
const checkAvatar = MI.test.obj<IUser['avatar']>({
  fileName: 'string',
  data: 'string',
});

// User schema
const User = MI.init<IUser>({
  id: 'pk',
  name: 'string',
  email: '?email',
  displayName: { type: '?string', default: '' },
  age: 'number',
  lastLogin: 'date',
  created: 'date',
  active: 'boolean',
  boss: { type: 'fk', nullable: true },
  foo: { type: '?string', nullable: true },
  avatar: { type: '?object', refine: checkAvatar },
  avatar2: { type: 'object', nullable: true, refine: checkAvatar },
  children: 'string[]',
  parentId: { type: 'fk', nullable: true, default: null },
  color: 'color',
  color2: {
    type: 'string',
    refine: (arg: unknown): arg is IUser['color2'] => MI.test.color(arg),
  },

});

// Print results
const user1 = User.new({ id: 1234 });
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
