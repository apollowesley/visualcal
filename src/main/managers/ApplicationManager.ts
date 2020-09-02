import { app, BrowserWindow, dialog, ipcMain, ipcRenderer } from 'electron';
import { TypedEmitter } from 'tiny-typed-emitter';
import { IpcChannels } from '../../constants';

interface QuitEventOptions {
  cancel?: boolean;
  reason?: string;
}

interface Events {
  quitting: (opts: QuitEventOptions) => void;
}

export class ApplicationManager extends TypedEmitter<Events> {

  constructor() {
    super();
    ipcMain.on(IpcChannels.application.quit.request, (event) => {
      const cancelled = this.quit();
      if (!cancelled) event.reply(IpcChannels.application.quit.response, cancelled);
    });
  }

  quit(reason?: string, verify = true) {
    const opts: QuitEventOptions = {
      reason: reason
    };
    this.emit('quitting', opts); // Notify the main process managers that we are quitting and give them a chance to cancel
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow && verify) {
      // Ask the user in a dialog over the focuses window if they really want to quit
      const dialogResult = dialog.showMessageBoxSync(focusedWindow, { message: 'Are you sure you want to quit?', title: 'Quitting', buttons: [ 'Yes', 'No' ], cancelId: 1, defaultId: 0, type: 'question' });
      opts.cancel = dialogResult === 1;
    }
    if (opts.cancel) return false;
    app.quit();
    return true;
  }

  showErrorAndQuit(title: string, message: string) {
    dialog.showErrorBox(title, message);
    this.quit(message, false);
  }

}
