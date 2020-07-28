import { ipcMain } from 'electron';
import { EventEmitter } from 'events';
import { IpcChannels } from '../../@types/constants';

export class LoginManager extends EventEmitter {

  constructor() {
    super();
    ipcMain.on(IpcChannels.user.login.request, (event, credentials: LoginCredentials) => {
      // TODO: Perform actual login
      event.reply(IpcChannels.user.login.response, credentials);
    });
  }

}
