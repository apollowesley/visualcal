interface VisualCalWindowOptions {
  id: VisualCalWindow;
}

declare module Electron {

  interface BrowserWindow {
    visualCal: VisualCalWindowOptions;
  }

}
