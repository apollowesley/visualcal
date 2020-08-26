interface VisualCalWindowOptions {
  id: VisualCalWindow;
}

declare module Electron {

  interface BrowserWindow {
    visualCal: VisualCalWindowOptions;
  }

  interface IpcMain extends NodeJS.EventEmitter {
    sendToAll(channelName: string, ...args: any[]);
  }

}

interface ElectronIpcLogEvent {
  channel: string;
  data: any;
  sent: boolean;
  sync: boolean;
}

declare module 'electron-ipc-log';
