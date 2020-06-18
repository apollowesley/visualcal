interface VisualCalWindowOptions {
  id: string;
  isMain?: boolean;
  isConsole?: boolean;
  isLogin?: boolean;
}

declare module Electron {

  interface BrowserWindow {
    visualCal: VisualCalWindowOptions;
  }

}
