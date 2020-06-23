export interface Person {
  nameFirst: string;
  nameLast: string;
  email?: string;
}

export interface User extends Person {
  email: string;
  token?: string;
  bio?: string;
  image?: string;
  roles?: string[];
}

export interface UserForRegistration {
  email: string;
  nameFirst: string;
  nameLast: string;
  password: string;
  bio?: string;
  image?: string;
  roles?: string[];
}

export interface UserForLogin {
  email: string;
  password: string;
}

export interface SessionForCreate {
  name: string;
  username: string;
  procedureShortName?: string;
  lastSectionShortName?: string;
  lastActionName?: string;
}

export interface UserSessionConfiguration {
  communication?: CommunicationConfiguration;
}

export interface SessionForDb extends SessionForCreate {
  created: Date;
  updated: Date;
}

export interface UserSession extends SessionForDb {
  id: string;
  configuration?: UserSessionConfiguration;
}

export interface Profile {
  email: string;
  bio?: string;
  image?: string;
}

export interface ProfileResponse {
  profile: Profile;
}

export interface UserForUpdate {
  email?: string;
  bio?: string;
  password?: string;
  image?: string;
}

export interface UserForTokenRenew {
  email: string;
  token: string;
}

export interface TokenRenewResponse {
  token: string;
}

export interface UserServerConfig {
  rolesEnabled: boolean;
}

export interface ActionRunForCreate {
  sessionId: string;
  name: string;
}

export interface ActionRunForDb extends ActionRunForCreate {
  created: Date;
  updated: Date;
}

export interface ActionRun extends ActionRunForDb {
  id: string;
}
