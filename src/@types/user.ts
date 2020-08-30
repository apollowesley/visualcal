interface Person {
  nameFirst: string;
  nameLast: string;
  email?: string;
}

interface User extends Person {
  email: string;
  token?: string;
  bio?: string;
  image?: string;
  roles?: string[];
}

interface LoginCredentials {
  username: string;
  password: string;
}
