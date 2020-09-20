import { TypedEmitter } from 'tiny-typed-emitter';
import { User, ViewInfo } from '../types/session';
import { IpcChannels as SessionViewIpcChannels, SessionViewRequestResponseInfo, Procedure, Session } from 'visualcal-common/types/session-view-info';
import { IpcChannels as LoginIpcChannels, LoginCredentials } from 'visualcal-common/types/user';
// import { IpcChannels as ProcedureIpcChannels } from 'visualcal-common/types/procedure';
import { ProcedureForCreate } from 'visualcal-common/types/procedure';
import { SessionForCreate } from 'visualcal-common/types/session';

interface Events {
  temp: () => void;
}

export class Ipc extends TypedEmitter<Events> {

  constructor() {
    super();
  }

  private get ipcRenderer() { return window.electron.ipcRenderer; }


  send(channel: string, ...args: unknown[]) {
    this.ipcRenderer.send(channel, ...args);
  }

  request<TReturn, TError>(requestChannel: string, responseChannel: string, errorChannel: string, ...args: unknown[]) {
    return new Promise<TReturn>((resolve, reject) => {
      this.ipcRenderer.once(errorChannel, (_, err: TError) => {
        return reject(err);
      });
      this.ipcRenderer.once(responseChannel, (_, response: TReturn) => {
        return resolve(response);
      });
      this.send(requestChannel, ...args);
    });
  }

  async getViewInfo() {
    return await this.request<ViewInfo | null, string>('session-view-info-request', 'session-view-info-response', 'session-view-info-error');
  }

  async login(credentials: LoginCredentials) {
    return await this.request<User, string>(LoginIpcChannels.Request, LoginIpcChannels.Response, LoginIpcChannels.Error, credentials);
  }

  async getCurrentUser() {
    return await this.request<User | null, Error>('user-active-request', 'user-active-response', 'user-active-error');
  }

  async getProcedures() {
    return await this.request<Procedure[], string>('getAll-procedures-request', 'getAll-procedures-response', 'getAll-procedures-error');
  }

  async getProcedureExists(procedureName: string) {
    return await this.request<boolean, string>('get-exists-procedure-request', 'get-exists-procedure-response', 'get-exists-procedure-error', procedureName);
  }

  async getActiveProcedureName() {
    return await this.request<string, string>('get-active-procedure-request', 'get-active-procedure-response', 'get-active-procedure-error');
  }

  async setActiveProcedure(procedureName: string) {
    return await this.request<Procedure, string>('set-active-procedure-request', 'set-active-procedure-response', 'set-active-procedure-error', procedureName);
  }

  async createProcedure(procedure: ProcedureForCreate) {
    return await this.request<Procedure, string>('create-procedure-request', 'create-procedure-response', 'create-procedure-error', procedure);
  }

  async getSessions() {
    return await this.request<Session[], string>('getAll-sessions-request', 'getAll-sessions-response', 'getAll-sessions-error');
  }

  async getSessionExists(email: string, sessionName: string) {
    return await this.request<boolean, string>('get-exists-session-request', 'get-exists-session-response', 'get-exists-session-error', { email: email, sessionName: sessionName });
  }

  async setActiveSession(email: string, sessionName: string) {
    return await this.request<Session, string>('set-active-session-request', 'set-active-session-response', 'set-active-session-error', { email: email, sessionName: sessionName });
  }

  async createSession(session: SessionForCreate) {
    return await this.request<Session, string>('create-session-request', 'create-session-response', 'create-session-error', session);
  }

  async getSessionViewInfo() {
    return await this.request<SessionViewRequestResponseInfo | null, string>(SessionViewIpcChannels.Request, SessionViewIpcChannels.Response, SessionViewIpcChannels.Error);
  }

}
