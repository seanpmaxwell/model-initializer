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
const checkAvatar = MI.checkObj<IUser['avatar']>([
  { prop: 'fileName', type: 'string' },
  { prop: 'data', type: 'string' }
]);

// Setup "User schema"
const User = MI.init<IUser>([
  { prop: 'id', type: 'pk' },
  { prop: 'name', type: 'string' },
  { prop: 'email', type: 'string', optional: true },
  { prop: 'displayName', type: 'string', optional: true, default: '' },
  { prop: 'age', type: 'number' },
  { prop: 'lastLogin', type: 'date' },
  { prop: 'created', type: 'date' },
  { prop: 'active', type: 'boolean' },
  { prop: 'boss', type: 'fk', nullable: true, default: null },
  { prop: 'avatar', type: 'object', optional: true, vldrFn: checkAvatar },
  { prop: 'children', type: 'string[]', optional: false },
]);

// Print results
const user1 = User.new({ name: 'john' });
console.log(user1)

// Test errors
MI.timeCloneFns = {
  cloneDeep: arg => arg,
  validateTime: arg => false,
  toDate: arg => new Date(),
}

// Should throw error
// ModelInitializer.init<{day: 'date'}>([
//   { prop: 'day', type: 'date', default: 'horse' as any }
// ]);
// ModelInitializer.init<{ children: string[] }>([
//   { prop: 'children', type: 'string[]', default: 'horse' as any }
// ]);
// User.new({ children: 'horse' as any })
