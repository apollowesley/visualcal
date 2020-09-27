export const enum IpcChannels {
  GetSessionsRequest = 'sessions-get-request',
  GetSessionsResponse = 'sessions-get-response',
  GetSessionError = 'sessions-get-error',
}

export interface SessionForCreate {
  name: string;
  procedureName: string;
  description: string;
  username: string;
}
