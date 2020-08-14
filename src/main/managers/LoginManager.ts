import { ipcMain } from 'electron';
import { EventEmitter } from 'events';
import { IpcChannels } from '../../constants';

export class LoginManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.user.login.request, async (event, credentials: LoginCredentials) => {
      // TODO: Perform actual login
      const user: User = {
        email: credentials.username,
        nameFirst: 'Unknown',
        nameLast: 'User'
      };
      global.visualCal.userManager.active = user;
      event.reply(IpcChannels.user.login.response, credentials);
      if (global.visualCal.windowManager.loginWindow) global.visualCal.windowManager.loginWindow.hide(); // Hide first, so we don't loose the only open BrowserWindow instance
      await global.visualCal.windowManager.showSelectProcedureWindow(); // Show SelectProcedureWindow to capture it's instance
      if (global.visualCal.windowManager.loginWindow) global.visualCal.windowManager.loginWindow.close(); // Finally close the LoginWindow
    });
  }

}
