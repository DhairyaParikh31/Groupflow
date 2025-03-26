export * from './members';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'leader';
  area: string;
}