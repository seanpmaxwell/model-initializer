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
  avatar?: { fileName: string; data: string };
}

// Create check avatar function
const checkAvatar = MI.checkObj<IUser['avatar']>({
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
  boss: { type: 'fk', nullable: true, default: null },
  avatar: { type: '?object', vldrFn: checkAvatar },
  children: 'string[]',
});

// Print results
const user1 = User.new({ id: 1234 });
console.log(user1)

// Test errors
// MI.timeCloneFns = {
//   cloneDeep: arg => arg,
//   validateTime: arg => false,
//   toDate: arg => new Date(),
// }

// Should throw error

User.new({ email: 'horse@horse.com' })
