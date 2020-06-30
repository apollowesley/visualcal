import { EventEmitter } from 'events';
import { ipcMain, dialog } from 'electron';
import { IpcChannels } from '../../@types/constants';

export class UserInteractionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on('user-instruction-result', (event, result: InstructionResponse) => {
      const node = global.visualCal.nodeRed.app.settings.findNodeById(result.nodeId);
      if (!node) {
        dialog.showErrorBox('User Instruction Error', 'Unable to locate node that requested a response.');
        return;
      }
      node.emit('response', result);
    });
    ipcMain.on('user-input-result', (event, result: UserInputResponse) => {
      const node = global.visualCal.nodeRed.app.settings.findNodeById(result.nodeId);
      if (!node) {
        dialog.showErrorBox('User Input Error', 'Unable to locate node that requested a response.');
        return;
      }
      node.emit('response', result);
    });
  }

  async showInstruction(request: InstructionRequest) {
    await global.visualCal.windowManager.ShowUserInstructionWindow(request);
  }

  async showInput(request: UserInputRequest) {
    await global.visualCal.windowManager.ShowUserInputWindow(request);
  }

}
