interface VisualCalWindowOptions {
  id: import('../enums').VisualCalWindow;
}

declare module Electron {

  interface BrowserWindow {
    visualCal: VisualCalWindowOptions;
  }

}
