import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import path from 'path';
import { VisualCalWindow } from '../../../constants';
import { isDev } from '../../utils';

type HtmlPathType = 'bootstrap' | 'public' | 'url' | 'raw';

const createWindowOptions = (id: VisualCalWindow, htmlPath: string, pathType: HtmlPathType, browserWindowOptions?: BrowserWindowConstructorOptions) => {
  const config: CreateWindowOptions = {
    id: id,
    htmlPath: pathType === 'bootstrap' ? path.join(global.visualCal.dirs.html.bootstrapStudio, htmlPath) : pathType === 'public' ? path.join(global.visualCal.dirs.html.windows, htmlPath) : pathType === 'url' ? htmlPath : htmlPath,
    htmlPathType: pathType
  };
  if (browserWindowOptions) {
    if (!browserWindowOptions.title) browserWindowOptions.title = `VisualCal - ${browserWindowOptions.title}`;
    if (!browserWindowOptions.webPreferences) browserWindowOptions.webPreferences = { nodeIntegration: true, nodeIntegrationInSubFrames: true,  };
  }
  if (!browserWindowOptions) browserWindowOptions = { title: 'VisualCal', webPreferences: { nodeIntegration: true, nodeIntegrationInSubFrames: true }};
  config.browserWindow = browserWindowOptions;
  return config;
};

const mainWindow = () => createWindowOptions(VisualCalWindow.Main, 'session-view.html', 'bootstrap', { title: 'Session' }); // createWindowOptions(VisualCalWindow.Main, 'index.html', 'bootstrap');
const loadingWindow = () => createWindowOptions(VisualCalWindow.Loading, 'loading.html', 'public', { height: 200, width: 400, frame: false, maximizable: false, center: true, fullscreenable: false, alwaysOnTop: true, minimizable: false, resizable: false });
const loginWindow = () => createWindowOptions(VisualCalWindow.Login, 'login.html', 'bootstrap', { title: 'Login' });
const consoleWindow = () => createWindowOptions(VisualCalWindow.Console, 'console.html', 'public', { height: 600, width: 800, title: 'Log' });
const nodeRedEditorWindow = () => createWindowOptions(VisualCalWindow.NodeRedEditor, `http://localhost:${global.visualCal.config.httpServer.port}/red`, 'url', { title: 'Logic Editor', webPreferences: { nodeIntegration: false, preload: path.join(global.visualCal.dirs.renderers.windows, 'node-red.js') } });
const createProcedureWindow = () => createWindowOptions(VisualCalWindow.CreateProcedure, 'procedure-create.html', 'bootstrap', { title: 'Create Procedure' });
const createSessionWindow = () => createWindowOptions(VisualCalWindow.CreateSession, 'session-create.html', 'bootstrap', { title: 'Create Session' });
const userInputWindow = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.UserInput, 'user-action.html', 'bootstrap', { height: 750, width: 1000, title: 'User Input', parent, modal: true, resizable: false, fullscreenable: false });
const createCommIfaceWindow = () => createWindowOptions(VisualCalWindow.CreateCommInterface, 'create-comm-iface.html', 'bootstrap', { height: 750, width: 1000, title: 'Add Communication Interface to Session' });
const interactiveDeviceControlWindow = () => createWindowOptions(VisualCalWindow.InteractiveDeviceControl, 'interactive-device-control.html', 'bootstrap', { height: 750, width: 1000, title: 'Device Control' });
const selectProcedureWindow = () => createWindowOptions(VisualCalWindow.SelectProcedure, 'procedure-select.html', 'bootstrap', { height: 750, width: 1000, title: 'Select Procedure' });
const selectSessionWindow = () => createWindowOptions(VisualCalWindow.SelectSession, 'session-select.html', 'bootstrap', { height: 750, width: 1000, title: 'Select Session' });
const updateAppWindow = () => createWindowOptions(VisualCalWindow.UpdateApp, 'update-app.html', 'bootstrap', { height: 750, width: 1000, title: 'Update' });
const benchConfigView = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.BenchConfigView, 'bench-configurations-view.html', 'bootstrap', { height: 850, width: 1200, title: 'Bench Configurations', parent, modal: true });
const deviceBeforeWrite = (parent: BrowserWindow) => createWindowOptions(VisualCalWindow.DeviceBeforeWrite, 'device-before-write.html', 'bootstrap', { height: 850, width: 1200, title: 'Device - Before write', parent, modal: true });
const browserViewTest = () => createWindowOptions(VisualCalWindow.BrowserViewTest, 'browser-view-test-main.html', 'bootstrap', { title: 'BrowserView Test' });

export const getConfig = (id: VisualCalWindow, parent?: BrowserWindow) => {
  switch (id) {
    case VisualCalWindow.Console:
      return consoleWindow();
    case VisualCalWindow.CreateProcedure:
      return createProcedureWindow();
    case VisualCalWindow.CreateSession:
      return createSessionWindow();
    case VisualCalWindow.Loading:
      return loadingWindow();
    case VisualCalWindow.Login:
      return loginWindow();
    case VisualCalWindow.Main:
      return mainWindow();
    case VisualCalWindow.NodeRedEditor:
      return nodeRedEditorWindow();
    case VisualCalWindow.UserInput:
      if (!parent) throw new Error('Parent window is required');
      return userInputWindow(parent);
    case VisualCalWindow.SelectProcedure:
      return selectProcedureWindow();
    case VisualCalWindow.SelectSession:
      return selectSessionWindow();
    case VisualCalWindow.InteractiveDeviceControl:
      return interactiveDeviceControlWindow();
    case VisualCalWindow.UpdateApp:
      return updateAppWindow();
    case VisualCalWindow.CreateCommInterface:
      return createCommIfaceWindow();
    case VisualCalWindow.BenchConfigView:
      if (!parent) throw new Error('Parent window is required');
      return benchConfigView(parent);
    case VisualCalWindow.DeviceBeforeWrite:
      if (!parent) throw new Error('Parent window is required');
      return deviceBeforeWrite(parent);
    case VisualCalWindow.BrowserViewTest:
      return browserViewTest();
    default:
      throw new Error(`Invalid window Id, ${id}`);
  }
};
