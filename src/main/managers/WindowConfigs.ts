import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import path from 'path';

type HtmlPathType = 'bootstrap' | 'public' | 'url' | 'raw';

interface BrowserWindowOptions {
  height?: number;
  width?: number;
  nodeIntegration?: boolean;
  autoHideMenuBar?: boolean;
  preload?: string;
  subTitle?: string;
  parent?: BrowserWindow;
  model?: boolean;
  frame?: boolean;
  fullscreenable?: boolean;
}

const createWindowOptions = (id: VisualCalWindow, htmlPath: string, pathType: HtmlPathType, browserWindowOptions: BrowserWindowOptions = {}) => {
  const config: CreateWindowOptions = {
    id: id,
    htmlPath: pathType === 'bootstrap' ? path.join(global.visualCal.dirs.html.bootstrapStudio, htmlPath) : pathType === 'public' ? path.join(global.visualCal.dirs.html.windows, htmlPath) : pathType === 'url' ? htmlPath : htmlPath,
    htmlPathType: pathType,
    browserWindow: {
      title: browserWindowOptions.subTitle ? `VisualCal - ${browserWindowOptions.subTitle}` : 'VisualCal',
      frame: false,
      transparent: false,
      resizable: false,
      height: browserWindowOptions.height,
      width: browserWindowOptions.width,
      webPreferences: {
        nodeIntegration: browserWindowOptions.nodeIntegration || true,
        preload: browserWindowOptions.preload
      }
    }
  }
  return config;
}

const mainWindow = () => createWindowOptions(VisualCalWindow.Main, 'index.html', 'bootstrap');
const loadingWindow = () => createWindowOptions(VisualCalWindow.Loading, 'loading.html', 'public', { height: 200, width: 400 });
const loginWindow = () => createWindowOptions(VisualCalWindow.Login, 'login.html', 'bootstrap', { subTitle: 'Login' });
const consoleWindow = () => createWindowOptions(VisualCalWindow.Console, 'loading.html', 'public', { height: 600, width: 800, autoHideMenuBar: true, subTitle: 'Log' });
const nodeRedEditorWindow = () => createWindowOptions(VisualCalWindow.NodeRedEditor, `http://localhost:${global.visualCal.config.httpServer.port}/red`, 'url', { subTitle: 'Logic Editor', nodeIntegration: false, preload: path.join(global.visualCal.dirs.renderers.windows, 'node-red.js') });
const createProcedureWindow = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.CreateProcedure, 'procedure-create.html', 'bootstrap', { parent: parent, model: true, subTitle: 'Create Procedure' });
const createSessionWindow = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.CreateSession, 'session-create.html', 'bootstrap', { parent: parent, model: true, subTitle: 'Create Session' });
const viewSessionWindow = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.ViewSession, 'session-view.html', 'bootstrap', { parent: parent, model: false, subTitle: 'Session' });
const userInputWindow = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.UserInput, 'user-action.html', 'bootstrap', { height: 750, width: 1000, model: true, frame: false, fullscreenable: false, parent: parent, subTitle: 'User Input' });
const createCommIfaceWindow = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.CreateCommInterface, 'create-comm-iface.html', 'bootstrap', { height: 750, width: 1000, model: true, frame: false, fullscreenable: false, parent: parent, subTitle: 'Add Communication Interface to Session' });
const interactiveDeviceControlWindow = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.InteractiveDeviceControl, 'interactive-device-control.html', 'bootstrap', { height: 750, width: 1000, model: true, frame: false, fullscreenable: false, parent: parent, subTitle: 'Device Control' });
const selectProcedureWindow = () => createWindowOptions(VisualCalWindow.SelectProcedure, 'procedure-select.html', 'bootstrap', { height: 750, width: 1000, model: true, frame: false, fullscreenable: false, subTitle: 'Select Procedure' });
const updateAppWindow = () => createWindowOptions(VisualCalWindow.UpdateApp, 'update-app.html', 'bootstrap', { height: 750, width: 1000, frame: false, fullscreenable: false, subTitle: 'Update' });

export const getConfig = (id: VisualCalWindow, parent?: BrowserWindow) => {
  switch (id) {
    case VisualCalWindow.Console:
      return consoleWindow()
    case VisualCalWindow.CreateProcedure:
      if (!parent) throw new Error('Parent window is required to create this window');
      return createProcedureWindow(parent);
    case VisualCalWindow.CreateSession:
      if (!parent) throw new Error('Parent window is required to create this window');
      return createSessionWindow(parent);
    case VisualCalWindow.Loading:
      return loadingWindow();
    case VisualCalWindow.Login:
      return loginWindow();
    case VisualCalWindow.Main:
      return mainWindow();
    case VisualCalWindow.NodeRedEditor:
      return nodeRedEditorWindow();
    case VisualCalWindow.UserInput:
      if (!parent) throw new Error('Parent window is required to create this window');
      return userInputWindow(parent);
    case VisualCalWindow.SelectProcedure:
      return selectProcedureWindow();
    case VisualCalWindow.InteractiveDeviceControl:
      if (!parent) throw new Error('Parent window is required to create this window');
      return interactiveDeviceControlWindow(parent);
    case VisualCalWindow.UpdateApp:
      return updateAppWindow();
    case VisualCalWindow.ViewSession:
      if (!parent) throw new Error('Parent window is required to create this window');
      return viewSessionWindow(parent);
    case VisualCalWindow.CreateCommInterface:
      if (!parent) throw new Error('Parent window is required to create this window');
      return createCommIfaceWindow(parent);
    default:
      throw new Error(`Invalid window Id, ${id}`);
  }
}
