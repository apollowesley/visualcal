import { BrowserWindow, ipcMain } from 'electron';
import { EventEmitter } from 'events';
import { IpcChannels } from '../../constants';

export class UserManager extends EventEmitter {

  private fActive: User | null = null;

  constructor() {
    super();
    ipcMain.on(IpcChannels.user.active.request, (event) => event.reply(IpcChannels.user.active.response, this.active));
  }

  get active() { return this.fActive; }
  set active(user: User | null) {
    this.fActive = user;
    BrowserWindow.getAllWindows().forEach(w => {
      if (!w.isDestroyed) w.webContents.send(IpcChannels.user.active.changed, this.fActive);
    });
  }

}
