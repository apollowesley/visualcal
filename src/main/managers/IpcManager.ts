import { EventEmitter } from 'events';
import { ipcMain } from 'electron';
import { IpcChannels } from '../../@types/constants';
import { dirs, files } from '../../common/global-window-info';
import { WindowManager } from './WindowManager';

export class IpcManager extends EventEmitter {

  private fWindowManager: WindowManager;

  constructor(windowManager: WindowManager) {
    super();
    this.fWindowManager = windowManager;
    ipcMain.on(IpcChannels.getDirs, (event) => event.returnValue = dirs());
    ipcMain.on(IpcChannels.getFiles, (event) => event.returnValue = files());
    ipcMain.on(IpcChannels.windows.show, async (_, windowId: VisualCalWindow) => await this.fWindowManager.show(windowId));
    ipcMain.on(IpcChannels.windows.showErrorDialog, async (event, error: Error) => await this.fWindowManager.showErrorDialog(event.sender, error));
  }

}
