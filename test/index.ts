import ModelInitializer from '../src';


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

// Setup "User schema"
const User = ModelInitializer.init<IUser>([
  { prop: 'id', type: 'pk' },
  { prop: 'name', type: 'string' },
  { prop: 'email', type: 'string', optional: true },
  { prop: 'displayName', type: 'string', optional: true, default: '' },
  { prop: 'age', type: 'number' },
  { prop: 'lastLogin', type: 'date' },
  { prop: 'created', type: 'date' },
  { prop: 'active', type: 'boolean' },
  { prop: 'boss', type: 'fk', nullable: true, default: null },
  { prop: 'avatar', type: 'object', optional: true, vldrFn: _checkAvatar },
  { prop: 'children', type: 'string[]', optional: false },
]);

// Validate Avatar object
function _checkAvatar(arg: unknown): arg is IUser['avatar'] {
  return ModelInitializer.checkObj<IUser['avatar']>([
    { prop: 'fileName', type: 'string' },
    { prop: 'data', type: 'string' }
  ])(arg);
}

// Print results
const user1 = User.new({ name: 'john' });
console.log(user1)

// Test errors
ModelInitializer.timeCloneFns = {
  cloneDeep: arg => arg,
  validateTime: arg => false,
  toDate: arg => new Date(),
}

// Should throw error
const Post = ModelInitializer.init<{day: 'date'}>([
  { prop: 'day', type: 'date', default: 'horse' as any }
]);
