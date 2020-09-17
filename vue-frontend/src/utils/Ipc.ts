import { TypedEmitter } from 'tiny-typed-emitter';
import { ViewInfo } from '../types/session';
import { IpcChannels, SessionViewRequestResponseInfo } from 'visucal-common/types/session-view-info';

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

  async getViewInfo() {
    return await window.ipc.request<ViewInfo | null, string>('session-view-info-request', 'session-view-info-response', 'session-view-info-error');
  }

  async getSessionViewInfo() {
    return await window.ipc.request<SessionViewRequestResponseInfo | null, Error>(IpcChannels.Request, IpcChannels.Response, IpcChannels.Error);
  }

}
