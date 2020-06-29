import { BrowserWindow, dialog, app, ipcMain } from 'electron';
import path from 'path';
import * as WindowUtils from '../utils/Window';
import { ConsoleWindowConfig, NodeRedEditorWindowConfig, LoginWindowConfig, MainWindowConfig, LoadingWindowConfig, CreateProcedureWindowConfig, CreateSessionWindowConfig } from './WindowConfigs';

export class WindowManager {

  private fWindows: Set<BrowserWindow>;
  private fClosingAll: boolean = false;

  constructor() {
    this.fWindows = new Set<BrowserWindow>();
    ipcMain.on('get-visualcal-window-id-req', (event) => {
      try {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (!window) return;
        event.reply('get-visualcal-window-id-res', window.visualCal.id);
      } catch (error) {
        event.reply('get-visualcal-window-id-err', error);
      }
    });
    ipcMain.on('show-window', async (_, windowId: VisualCalWindow) => {
      switch (windowId) {
        case VisualCalWindow.Console:
          break;
        case VisualCalWindow.CreateProcedure:
          await this.ShowCreateProcedureWindow();
          break;
        case VisualCalWindow.CreateSession:
          await this.ShowCreateSessionWindow();
          break;
        case VisualCalWindow.Loading:
          break;
        case VisualCalWindow.Login:
          break;
        case VisualCalWindow.Main:
          break;
        case VisualCalWindow.NodeRedEditor:
          break;
        default:
          throw new Error(`Invalid window Id, ${windowId}`);
      }
    });
  }

  get(id: VisualCalWindow) {
    return Array.from(this.fWindows).find(w => w.visualCal.id === id);
  }

  get loadingWindow() {
    const window = this.get(VisualCalWindow.Loading);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get loginWindow() {
    const window = this.get(VisualCalWindow.Login);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get mainWindow() {
    const window = this.get(VisualCalWindow.Main);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get consoleWindow() {
    const window = this.get(VisualCalWindow.Console);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get nodeRedEditorWindow() {
    const window = this.get(VisualCalWindow.NodeRedEditor);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get createProcedureWindow() {
    const window = this.get(VisualCalWindow.CreateProcedure);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  get createSessionWindow() {
    const window = this.get(VisualCalWindow.CreateSession);
    if (window && !window.isDestroyed()) return window;
    return undefined;
  }

  private checkWindowExists(options: { id: VisualCalWindow }) {
    const window = Array.from(this.fWindows).find(w => w.visualCal.id === options.id) !== undefined;
    if (window) throw new Error(`Duplicate window Id, ${options.id}`);
  }

  add(window: BrowserWindow) {
    global.visualCal.logger.info('Adding window', { windowId: window.id });
    if (!window.visualCal) throw new Error(`Window with id (non-VisualCal id) ${window.id} is missing the visualCal property!`);
    this.checkWindowExists({ id: window.visualCal.id });
    this.fWindows.add(window);
    window.once('closed', () => {
      global.visualCal.logger.info('Window closed', { windowId: window.visualCal.id });
      this.remove(window.visualCal.id);
    });
  }

  remove(id: VisualCalWindow) {
    global.visualCal.logger.info('Removing window', { windowId: id });
    const existing = this.get(id);
    if (!this.fClosingAll && !existing) throw new Error(`Window not found, ${id}`);
    if (existing) this.fWindows.delete(existing);
    return existing;
  }

  create(options: CreateWindowOptions) {
    global.visualCal.logger.info('Creating window', { windowId: options.id });
    this.checkWindowExists({ id: options.id });
    const newWindow = new BrowserWindow(options.config);
    newWindow.visualCal = {
      id: options.id
    };
    this.add(newWindow);
    return newWindow;
  }

  close(id: VisualCalWindow) {
    global.visualCal.logger.info('Closing window', { windowId: id });
    const window = this.get(id);
    if (!window) return false;
    try {
      window.close();
    } catch (error) {
      throw error;
    }
    return true;
  }

  changeVisiblity(id: VisualCalWindow, show: boolean = true) {
    global.visualCal.logger.info('Changing window visiblity', { windowId: id, show: show });
    const window = this.get(id);
    if (!window) throw new Error(`Window not found, ${id}`);
    if (show) window.show();
    else window.hide();
  }

  closeAll() {
    this.fClosingAll = true;
    this.fWindows.forEach(w => {
      w.close()
    });
    this.fWindows.clear();
  }

  // *************************************************
  // ************** CREATE/SHOW WINDOWS **************
  // *************************************************

  // Loading window
  async ShowLoading(closedCallback: () => void, duration: number = 5000) {
    let window = this.loadingWindow;
    if (window) {
      window.show();
      return window;
    }
    window = global.visualCal.windowManager.create(LoadingWindowConfig());
    if (!window) throw new Error('Window must be defined');
    window.webContents.once('did-finish-load', () => {
      if (window) window.show();
      setTimeout(() => {
        try {
          closedCallback();
          if (window) window.close();
        } catch (error) {
          console.error(error);
        }
      }, duration);
    });
    await window.loadFile(path.join(global.visualCal.dirs.html.windows, 'loading.html'));
    return window;
  }

    // Login window
    async ShowLogin() {
      let window = this.loginWindow;
      if (window) {
        window.show();
        return window;
      }
      window = this.create(LoginWindowConfig());
      WindowUtils.centerWindowOnNearestCurorScreen(window, false);
      await window.loadFile(path.join(global.visualCal.dirs.html.windows, 'login.html'));
      return window;
    }

  // Main window
  async ShowMain() {
    let window = this.mainWindow;
    if (window) {
      window.show();
      return window;
    }
    window = global.visualCal.windowManager.create(MainWindowConfig());
    if (!window) throw new Error('Window must be defined');
    WindowUtils.centerWindowOnNearestCurorScreen(window);
    if (process.platform !== 'darwin') window.setAutoHideMenuBar(true);
    window.once('close', (e) => {
      global.visualCal.windowManager.closeAll();
    });
    window.webContents.once('did-finish-load', async () => {
      if (!window) return
      window.title = 'VisualCal';
      window.show();
    });
    await window.loadFile(path.join(global.visualCal.dirs.html.bootstrapStudio, 'index.html'));
    return window;
  }
  
  // Console log window
  async ShowConsole() {
    let window = this.consoleWindow;
    if (window) {
      window.show();
      return window;
    }
    window = global.visualCal.windowManager.create(ConsoleWindowConfig());
    if (!window) throw new Error('Window must be defined');
    WindowUtils.centerWindowOnNearestCurorScreen(window, false);
    window.webContents.on('did-finish-load', () => {
      try {
        global.visualCal.logger.query({ fields: ['message'] }, (err, results) => {
          if (this.consoleWindow && !err && results && Array.isArray(results)) this.consoleWindow.webContents.send('results', [results]);
          else if (err) throw err;
        });
      } catch (error) {
        dialog.showErrorBox('Error querying log', error.message);
      }
    });
    await window.loadFile(path.join(global.visualCal.dirs.html.windows, 'console.html'));
    return window;
  }

  // Node-red editor window
  async ShowNodeRedEditor() {
    let window = this.nodeRedEditorWindow;
    if (window) {
      window.show();
      return window;
    }
    window = this.create(NodeRedEditorWindowConfig());
    WindowUtils.centerWindowOnNearestCurorScreen(window);
    await window.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/red`);
    return window;
  }

  // Create procedure window 
  async ShowCreateProcedureWindow() {
    let window = this.createProcedureWindow;
    if (window) {
      window.show();
      return window;
    }
    window = this.create(CreateProcedureWindowConfig());
    WindowUtils.centerWindowOnNearestCurorScreen(window, false);
    await window.loadFile(global.visualCal.dirs.html.procedure.create);
    return window;
  }

  // Create session window 
  async ShowCreateSessionWindow() {
    let window = this.createSessionWindow;
    if (window) {
      window.show();
      return window;
    }
    window = this.create(CreateSessionWindowConfig());
    WindowUtils.centerWindowOnNearestCurorScreen(window, false);
    await window.loadFile(global.visualCal.dirs.html.session.create);
    return window;
  }

}
