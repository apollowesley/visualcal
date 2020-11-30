import { EventEmitter } from 'events';
import { ipcMain, dialog } from 'electron';
import { IpcChannels } from '../../constants';
import { NodeRedManager } from './NodeRedManager';
import electronLog from 'electron-log';

const log = electronLog.scope('UserInteractionManager');

export class UserInteractionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.user.input.result, (_, result: UserInputResponse) => {
      const node = NodeRedManager.instance.findNodeById(result.nodeId);
      if (!node) {
        dialog.showErrorBox('User Input Error', 'Unable to locate node that requested a response.');
        return;
      }
      node.runtime.emit('response', result);
    });
  }

  async showInput(request: UserInputRequest) {
    if (request.showImage && request.assetFilename) {
      try {
        request.fileBase64Contents = await global.visualCal.assetManager.loadFromCurrentProcedure(request.assetFilename);
      } catch (error) {
        log.error(error.message);
      }
    }
    // await WindowManager.instance.ShowUserInputWindow(request);
    ipcMain.sendToAll(IpcChannels.user.input.request, request);
  }

}
