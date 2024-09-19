import ModelInitializer from '../dist';
// import ModelInitializer from '../src';


// User as it appears in the database
export interface IUser {
  id: number; // pk
  name: string;
  email: string;
  lastLogin: Date;
  created: Date;
  avatar?: { fileName: string; data: string };
}


const User = ModelInitializer.init<IUser>([
  {
    prop: 'id',
    type: 'pk',
  },
  {
    prop: 'name',
    type: 'string',
  },
  {
    prop: 'email',
    type: 'string',
  },
  {
    prop: 'lastLogin',
    type: 'date',
  },
  {
    prop: 'created',
    type: 'date',
  },
  {
    prop: 'avatar',
    type: 'object',
    optional: true,
    vldrFn: checkAvatar,
  },
]);

function checkAvatar(arg: unknown): arg is IUser['avatar'] {
  return (
    !!arg && typeof arg === 'object' && 
    'fileName' in arg && typeof arg.fileName === 'string' &&
    'data' in arg && typeof arg.data === 'string'
  )
}


const user1 = User.new({ name: 'john' });
console.log(user1)
