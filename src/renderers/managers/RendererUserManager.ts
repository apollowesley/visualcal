import { ipcRenderer } from 'electron';
import { EventEmitter } from 'events';
import { IpcChannels } from '../../constants';

export interface ActiveChangedCallback {
  (user: User | null): void;
}

export class RendererUserManager extends EventEmitter {

  private fActive: User | null = null;

  constructor() {
    super();
    ipcRenderer.on(IpcChannels.user.active.response, (_, user: User | null) => {
      this.fActive = user;
    });
    ipcRenderer.on(IpcChannels.user.active.changed, (_, user: User | null) => {
      console.info(user);
      this.fActive = user;
    });
    ipcRenderer.send(IpcChannels.user.active.request);
  }

  get active() { return this.fActive; }
  set active(user: User | null) { this.fActive = user; }

  private fActiveChanged: ActiveChangedCallback | null = null;
  get onActiveChanged() { return this.fActiveChanged; }
  set onActiveChanged(callback: ActiveChangedCallback | null) { this.fActiveChanged = callback; }

}
