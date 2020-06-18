import { IpcMainEvent, ipcMain } from 'electron';
import { IpcRequest } from "../../common/IpcRequest";
import { IpcChannel } from "./IpcChannel";
import { login } from '../security/index';

export class LoginChannel implements IpcChannel<LoginCredentials> {
  getName(): string {
    return 'login';
  }

  handle(event: IpcMainEvent, request: IpcRequest<LoginCredentials>): void {
    global.visualCal.logger.info(request);
    if (!request.responseChannel) {
      request.responseChannel = `${this.getName()}_response`;
    }
    if (!request.params || request.params.length <= 0) return event.sender.send('login-error', 'Missing credentials');
    event.sender.send(request.responseChannel, login(request.params[0]));
  }
}
