import { BrowserWindow } from 'electron';
import path from 'path';
import * as WindowUtils from '../utils/Window';
import { ConsoleWindowConfig, NodeRedEditorWindowConfig, LoginWindowConfig } from './WindowConfigs';
import { VisualCalWindow } from 'src/types/electron/enums';

export class WindowManager {

  private fWindows: Set<BrowserWindow>;
  private fMainWindow: BrowserWindow | undefined;
  private fConsoleWindow: BrowserWindow | undefined;
  private fNodeRedEditorWindow: BrowserWindow | undefined;
  private fClosingAll: boolean = false;

  constructor() {
    this.fWindows = new Set<BrowserWindow>();
  }

  get(id: VisualCalWindow) {
    return Array.from(this.fWindows).find(w => w.visualCal.id === id);
  }

  get mainWindow() {
    return this.fMainWindow && !this.fMainWindow.isDestroyed() ? this.fMainWindow : undefined;
  }

  get consoleWindow() {
    return this.fConsoleWindow && !this.fConsoleWindow.isDestroyed() ? this.fConsoleWindow : undefined;
  }

  get nodeRedEditorWindow() {
    return this.fNodeRedEditorWindow && !this.fNodeRedEditorWindow.isDestroyed() ? this.fNodeRedEditorWindow : undefined;
  }

  private checkWindowExists(options: { id: VisualCalWindow }) {
    if (options.id === VisualCalWindow.Main && this.mainWindow !== undefined) throw new Error('Main window already exists');
    if (options.id === VisualCalWindow.Console && this.consoleWindow !== undefined) throw new Error('Console window already exists');
    const existing = this.get(options.id);
    if (existing) throw new Error(`Duplicate window Id, ${options.id}`);
  }

  add(window: BrowserWindow) {
    global.visualCal.logger.info('Adding window', { windowId: window.id });
    this.checkWindowExists({ id: window.visualCal.id });
    if (window.visualCal.id === VisualCalWindow.Main) this.fMainWindow = window;
    if (window.visualCal.id === VisualCalWindow.Console) this.fConsoleWindow = window;
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
    if (!this.fClosingAll && existing) {
      if (existing.visualCal.id === VisualCalWindow.Main) this.fMainWindow = undefined;
      if (existing.visualCal.id === VisualCalWindow.Console) this.fConsoleWindow = undefined;
    }
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
    this.fMainWindow = undefined;
    this.fConsoleWindow = undefined;
    this.fWindows.clear();
  }

  // *************************************************
  // ************** CREATE/SHOW WINDOWS **************
  // *************************************************

  async ShowLogin() {
    let loginWindow = BrowserWindow.getAllWindows().find(w => w.visualCal.id === VisualCalWindow.Login && !w.isDestroyed && w.isClosable);
    if (loginWindow) {
      loginWindow.show();
      return;
    }
    loginWindow = this.create(LoginWindowConfig());
    if (!loginWindow) throw new Error('loginWindow cannot be null after creation');
    WindowUtils.centerWindowOnNearestCurorScreen(loginWindow, false);
    await loginWindow.loadFile(path.join(global.visualCal.dirs.html.windows, 'login.html'));
    return loginWindow;
  }

  // Create the console log window
  async ShowConsole() {
    if (global.visualCal.windowManager.consoleWindow) {
      console.info('Console window already exists');
      global.visualCal.windowManager.consoleWindow.show();
      return;
    }
    console.info('Creating console');
    // Create the hidden console window
    const conWindow = global.visualCal.windowManager.create(ConsoleWindowConfig());
    conWindow.webContents.on('did-finish-load', () => {
      if (global.visualCal.windowManager.consoleWindow) global.visualCal.windowManager.consoleWindow.webContents.send('results', global.visualCal.logger.query());
    });
    await conWindow.loadFile(path.join(global.visualCal.dirs.html.windows, 'console.html'));
    return conWindow;
  }

  async ShowNodeRedEditor() {
    if (this.nodeRedEditorWindow) {
      this.nodeRedEditorWindow.show();
      return;
    }
    this.fNodeRedEditorWindow = this.create(NodeRedEditorWindowConfig());
    WindowUtils.centerWindowOnNearestCurorScreen(this.fNodeRedEditorWindow, false);
    await this.fNodeRedEditorWindow.loadURL(`http://localhost:${global.visualCal.config.httpServer.port}/red`);
    return this.fNodeRedEditorWindow;
  }

}
