import { TypedEmitter } from 'tiny-typed-emitter';
import { User, ViewInfo } from '../types/session';
import { IpcChannels as SessionViewIpcChannels, SessionViewRequestResponseInfo } from 'visualcal-common/types/session-view-info';
import { IpcChannels as LoginIpcChannels, LoginCredentials } from 'visualcal-common/types/user';

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

  async getSessionViewInfo() {
    return await this.request<SessionViewRequestResponseInfo | null, string>(SessionViewIpcChannels.Request, SessionViewIpcChannels.Response, SessionViewIpcChannels.Error);
  }

  async login(credentials: LoginCredentials) {
    return await this.request<User, string>(LoginIpcChannels.Request, LoginIpcChannels.Response, LoginIpcChannels.Error, credentials);
  }

}
