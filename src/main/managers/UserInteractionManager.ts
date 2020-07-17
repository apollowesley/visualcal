import { EventEmitter } from 'events';
import { ipcMain, dialog } from 'electron';

export class UserInteractionManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on('user-instruction-result', (_, result: InstructionResponse) => {
      const node = global.visualCal.nodeRed.app.settings.findNodeById(result.nodeId);
      if (!node) {
        dialog.showErrorBox('User Instruction Error', 'Unable to locate node that requested a response.');
        return;
      }
      node.emit('response', result);
    });
    ipcMain.on('user-input-result', (_, result: UserInputResponse) => {
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
