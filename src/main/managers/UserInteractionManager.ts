import { EventEmitter } from 'events';
import { ipcMain, dialog } from 'electron';
import { IpcChannels } from '../../constants';

export class UserInteractionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.user.input.result, (_, result: UserInputResponse) => {
      const node = global.visualCal.nodeRed.app.settings.findNodeById(result.nodeId);
      if (!node) {
        dialog.showErrorBox('User Input Error', 'Unable to locate node that requested a response.');
        return;
      }
      node.emit('response', result);
    });
  }

  async showInput(request: UserInputRequest) {
    if (request.showImage && request.assetFilename) {
      try {
        request.fileBase64Contents = await global.visualCal.assetManager.loadFromCurrentProcedure(request.assetFilename);
      } catch (error) {
        console.error(error.message);
      }
    }
    await global.visualCal.windowManager.ShowUserInputWindow(request);
  }

}
