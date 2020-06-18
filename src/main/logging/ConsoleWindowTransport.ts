import Transport from 'winston-transport';

export class ConsoleWindowTransport extends Transport {

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  public log?(info: any, callback: () => void): any {
    try {
      this.emit('logged', info);
      const consoleWindow = global.visualCal.windowManager.consoleWindow;
      if (consoleWindow) consoleWindow.webContents.send('result', info);
    } catch (error) {
      console.error(error);
    }
    if (callback) callback();
  }

}
