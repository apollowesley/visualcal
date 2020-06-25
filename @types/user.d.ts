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

interface UserForRegistration {
  email: string;
  nameFirst: string;
  nameLast: string;
  password: string;
  bio?: string;
  image?: string;
  roles?: string[];
}

interface UserForLogin {
  email: string;
  password: string;
}

interface SessionForCreate {
  name: string;
  username: string;
  procedureShortName?: string;
  lastSectionShortName?: string;
  lastActionName?: string;
}

interface UserSessionConfiguration {
  communication?: CommunicationConfiguration;
}

interface SessionForDb extends SessionForCreate {
  created: Date;
  updated: Date;
}

interface UserSession extends SessionForDb {
  id: string;
  configuration?: UserSessionConfiguration;
}

interface Profile {
  email: string;
  bio?: string;
  image?: string;
}

interface ProfileResponse {
  profile: Profile;
}

interface UserForUpdate {
  email?: string;
  bio?: string;
  password?: string;
  image?: string;
}

interface UserForTokenRenew {
  email: string;
  token: string;
}

interface TokenRenewResponse {
  token: string;
}

interface UserServerConfig {
  rolesEnabled: boolean;
}

interface ActionRunForCreate {
  sessionId: string;
  name: string;
}

interface ActionRunForDb extends ActionRunForCreate {
  created: Date;
  updated: Date;
}

interface ActionRun extends ActionRunForDb {
  id: string;
}
