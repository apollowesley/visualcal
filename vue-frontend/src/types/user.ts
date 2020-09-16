import { BenchConfig } from './bench-config';
import { Session } from './session';

interface Person {
  nameFirst: string;
  nameLast: string;
  email?: string;
}

export interface User extends Person {
  email: string;
  sessions: Session[];
  benchConfigs: BenchConfig[];
  token?: string;
  bio?: string;
  image?: string;
  roles?: string[];
}
