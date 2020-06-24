import Transport from 'winston-transport';

export class ConsoleWindowTransport extends Transport {

  constructor(opts?: Transport.TransportStreamOptions) {
    super(opts);
  }

  public log?(info: any, callback: () => void): any {
    try {
      const consoleWindow = global.visualCal.windowManager.consoleWindow;
      if (consoleWindow) consoleWindow.webContents.send('result', info);
      this.emit('logged', info);
    } catch (error) {
      console.error(error);
    }
    if (callback) callback();
  }

}
