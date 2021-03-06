interface Person {
  nameFirst: string;
  nameLast: string;
  email?: string;
}

interface User extends Person {
  email: string;
  sessions: Session[];
  benchConfigs: import('visualcal-common/dist/bench-configuration').BenchConfig[];
  token?: string;
  bio?: string;
  image?: string;
  roles?: string[];
}

interface LoginCredentials {
  username: string;
  password: string;
}
