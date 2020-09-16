import { TypedEmitter } from 'tiny-typed-emitter';
import { Session } from '../types/session';
import { User } from '../types/user';

interface Events {
  temp: () => void;
}

export class Ipc extends TypedEmitter<Events> {

  constructor() {
    super();
  }

  private get ipcRenderer() { return window.electron.ipcRenderer; }


  send(channel: string, ...args: unknown[]) {
    this.ipcRenderer.send(channel, args);
  }

  request<TReturn, TError>(requestChannel: string, responseChannel: string, errorChannel: string, ...args: unknown[]) {
    return new Promise<TReturn>((resolve, reject) => {
      this.ipcRenderer.once(errorChannel, (_, err: TError) => {
        reject(err);
      });
      this.ipcRenderer.once(responseChannel, (_, response: TReturn) => {
        resolve(response);
      });
      this.send(requestChannel, args);
    });
  }

  async getCurrentUser() {
    return await window.ipc.request<User | null, string>('user-active-request', 'user-active-response', 'user-active-error');
  }

  async getAllSessions() {
    return await window.ipc.request<Session[], string>('session-get-all-for-active-user-request', 'session-get-all-for-active-user-response', 'session-get-all-for-active-user-error');
  }

}
