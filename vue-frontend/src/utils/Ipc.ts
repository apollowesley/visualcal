import { TypedEmitter } from 'tiny-typed-emitter';
import { Session } from '../types/session';

interface Events {
  temp: () => void;
}

export class Ipc extends TypedEmitter<Events> {

  constructor() {
    super();
  }

  private get ipcRenderer() { return window.electron.ipcRenderer; }

  send(channel: string, ...args: any[]) {
    this.ipcRenderer.send(channel, args);
  }

  request<TReturn, TError>(requestChannel: string, responseChannel: string, errorChannel: string, ...args: any[]) {
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

  async getAllSessions() {
    return await window.ipc.request<Session, string>('session-get-all-for-active-user-request', 'session-get-all-for-active-user-response', 'session-get-all-for-active-user-error');
  }

}
