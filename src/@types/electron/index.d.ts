interface VisualCalWindowOptions {
  id: VisualCalWindow;
}

declare module Electron {

  interface BrowserWindow {
    visualCal: VisualCalWindowOptions;
  }

}

interface ElectronIpcLogEvent {
  channel: string;
  data: any;
  sent: boolean;
  sync: boolean;
}

declare module 'electron-ipc-log';
