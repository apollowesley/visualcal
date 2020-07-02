import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../@types/constants';
import { dirs } from '../../common/global-window-info';

export class IpcManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.getDirs, (event) => event.returnValue = dirs);
  }

}
