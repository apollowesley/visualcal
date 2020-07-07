interface Session {
  name: string;
  username: string;
  procedureName: string;
  lastSectionName?: string;
  lastActionName?: string;
  configuration?: CommunicationConfiguration;
}
