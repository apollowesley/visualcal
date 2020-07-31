import Transport from 'winston-transport';
import { IpcChannels } from '../../constants';

export class ConsoleWindowTransport extends Transport {

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  public log?(info: any, callback: () => void): any {
    try {
      const consoleWindow = global.visualCal.windowManager.consoleWindow;
      if (consoleWindow) consoleWindow.webContents.send('result', info);
      const viewSessionWindow = global.visualCal.windowManager.viewSessionWindow;
      if (viewSessionWindow) viewSessionWindow.webContents.send(IpcChannels.log.all, info);
      this.emit('logged', info);
    } catch (error) {
      console.error(error);
    }
    if (callback) callback();
  }

}
