import { ipcRenderer } from 'electron';

export class IpcService {

  public async send<T>(channel: string, request: IpcRequest<string> = {}): Promise<T> {
    // If there's no responseChannel let's auto-generate it
    if (!request.responseChannel) request.responseChannel = `${channel}_response_${new Date().getTime()}`;
    ipcRenderer.send(channel, request);
    // This method returns a promise which will be resolved when the response has arrived.
    return new Promise((resolve, reject) => {
      if (!request.responseChannel) return reject('Missing responseChannel');
      return ipcRenderer.once(request.responseChannel, (event, response) => resolve(response));
    });
  }
  
  async login(credentials: LoginCredentials): Promise<string> {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('login-error', (event, err: string) => {
        return reject(err);
      });
      ipcRenderer.once('login-success', (event, args) => {
        return resolve(args);
      });
      const request: IpcRequest<LoginCredentials> = {
        responseChannel: 'login-success',
        params: [credentials]
      }
      ipcRenderer.send('login', request);
    });
  }

}
