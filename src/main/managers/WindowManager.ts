import { BrowserWindow } from 'electron';
import path from 'path';
import * as WindowUtils from '../utils/Window';

export class WindowManager {

  private fWindows: Set<BrowserWindow>;
  private fMainWindow: BrowserWindow | undefined;
  private fConsoleWindow: BrowserWindow | undefined;
  private fClosingAll: boolean = false;

  constructor() {
    this.fWindows = new Set<BrowserWindow>();
  }

  get(id: string) {
    return Array.from(this.fWindows).find(w => w.visualCal.id.toLocaleUpperCase() === id.toLocaleUpperCase());
  }

  get mainWindow() {
    return this.fMainWindow && !this.fMainWindow.isDestroyed() ? this.fMainWindow : undefined;
  }

  get consoleWindow() {
    return this.fConsoleWindow && !this.fConsoleWindow.isDestroyed() ? this.fConsoleWindow : undefined;
  }

  private checkWindowExists(options: { id: string, isMain?: boolean, isConsole?: boolean }) {
    if (options.isMain && this.mainWindow !== undefined) throw new Error('Main window already exists');
    if (options.isConsole && this.consoleWindow !== undefined) throw new Error('Console window already exists');
    const existing = this.get(options.id);
    if (existing) throw new Error(`Duplicate window Id, ${options.id}`);
  }

  add(window: BrowserWindow) {
    global.visualCal.logger.info('Adding window', { windowId: window.id });
    this.checkWindowExists({ id: window.visualCal.id, isMain: window.visualCal.isMain, isConsole: window.visualCal.isConsole });
    if (window.visualCal.isMain) this.fMainWindow = window;
    if (window.visualCal.isConsole) this.fConsoleWindow = window;
    this.fWindows.add(window);
    window.once('closed', () => {
      global.visualCal.logger.info('Window closed', { windowId: window.visualCal.id });
      this.remove(window.visualCal.id);
    });
  }

  remove(id: string) {
    global.visualCal.logger.info('Removing window', { windowId: id });
    const existing = this.get(id);
    if (!this.fClosingAll && !existing) throw new Error(`Window not found, ${id}`);
    if (!this.fClosingAll && existing) {
      if (existing.visualCal.isMain) this.fMainWindow = undefined;
      if (existing.visualCal.isConsole) this.fConsoleWindow = undefined;
    }
    if (existing) this.fWindows.delete(existing);
    return existing;
  }

  create(options: CreateWindowOptions) {
    global.visualCal.logger.info('Creating window', { windowId: options.id });
    this.checkWindowExists({ id: options.id, isMain: options.isMain, isConsole: options.isConsole });
    const newWindow = new BrowserWindow(options.config);
    newWindow.visualCal = {
      id: options.id,
      isMain: options.isMain,
      isConsole: options.isConsole,
      isLogin: options.isLogin,
    };
    this.add(newWindow);
    return newWindow;
  }

  close(id: string) {
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

  changeVisiblity(id: string, show: boolean = true) {
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
    let loginWindow = BrowserWindow.getAllWindows().find(w => w.visualCal.isLogin && !w.isDestroyed && w.isClosable);
    if (loginWindow) {
      loginWindow.show();
      return;
    }
    loginWindow = this.create({
      id: 'login',
      isLogin: true,
      config: {
        parent: this.mainWindow,
        center: true,
        webPreferences: {
          nodeIntegration: true
        }
      }
    });
    if (!loginWindow) throw new Error('loginWindow cannot be null after creation');
    WindowUtils.centerWindowOnNearestCurorScreen(loginWindow, false);
    await loginWindow.loadFile(path.join(global.visualCal.dirs.html, 'login.html'));
    return loginWindow;
  }

}
